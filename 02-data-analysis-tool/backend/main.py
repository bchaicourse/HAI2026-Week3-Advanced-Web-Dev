from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv
import os
import pandas as pd
import subprocess
from typing import List, Optional

# Load environment variables
load_dotenv()

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Load movies data
df = pd.read_csv('movies.csv')

# ================
# Pydantic Models
# ================

class Code(BaseModel):
    code: str

class FilterRequest(BaseModel):
    selected_columns: List[str]
    selected_genres: Optional[List[str]] = None
    year_range: Optional[List[int]] = None
    rating_range: Optional[List[float]] = None

class AnalyzeRequest(BaseModel):
    question: str
    filtered_data: List[dict]  # Will contain the filtered dataframe as list of records

class AnalyzeResponse(BaseModel):
    generated_code: str
    execution_output: str
    interpretation: str

# ================
# Helper Functions
# ================

def generate_code(task_description: str, df_schema: str) -> str:
    """Generate Python code to accomplish a task on a dataframe."""
    prompt = f"""
    Your code will be executed in the following environment:

    ```python
    import pandas as pd
    import numpy as np

    df = pd.read_csv('temp_data.csv')

    # YOUR CODE GOES HERE
    ```

    DataFrame schema:
    {df_schema}

    Task: {task_description}

    Write the code that will replace "# YOUR CODE GOES HERE".
    Make sure to print the result (do not save to variables without printing).

    Provide only executable Python code, no explanations.
    """

    response = client.beta.chat.completions.parse(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        response_format=Code,
        temperature=0
    )

    return response.choices[0].message.parsed.code

def execute_code(code: str, df: pd.DataFrame) -> str:
    """Execute generated code on a dataframe.

    WARNING: This is unsafe for production. Use sandboxing in real applications.
    """
    try:
        # Save dataframe to temp CSV
        df.to_csv('temp_data.csv', index=False)

        # Prepend imports and dataframe loading to the code
        full_code = f"""
import pandas as pd
import numpy as np

df = pd.read_csv('temp_data.csv')

{code}
"""

        # Write to file
        with open("generated_code.py", "w") as f:
            f.write(full_code)

        # Execute
        result = subprocess.run(
            ["python3", "generated_code.py"],
            capture_output=True,
            text=True,
            timeout=10
        )

        return result.stdout if result.returncode == 0 else result.stderr

    except Exception as e:
        return f"Error during execution: {str(e)}"

def interpret_result(result: str, question: str) -> str:
    """Interpret code execution result in natural language."""
    prompt = f"""
    Question: {question}

    Execution result:
    {result}

    Provide a clear, concise interpretation in 2-3 sentences.
    """

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0
    )

    return response.choices[0].message.content

def get_dataframe_schema(df: pd.DataFrame) -> str:
    """Generate a schema description for the LLM."""
    schema = f"Columns: {df.columns.tolist()}\n"
    schema += f"Data types:\n{df.dtypes.to_string()}\n"
    schema += f"Shape: {df.shape}\n"
    schema += f"\nSample data (first 3 rows):\n{df.head(3).to_string()}"
    return schema

# ================
# API Endpoints
# ================

@app.get("/")
def read_root():
    return {"message": "Data Analysis API is running"}

@app.get("/columns")
def get_columns():
    """Get all available columns from the dataset."""
    return {
        "columns": df.columns.tolist()
    }

@app.get("/filters/genres")
def get_genres():
    """Get all unique genres."""
    if 'Genre' in df.columns:
        genres = df['Genre'].dropna().unique().tolist()
        return {"genres": genres}
    return {"genres": []}

@app.get("/filters/years")
def get_year_range():
    """Get min and max release years."""
    if 'Release Year' in df.columns:
        return {
            "min_year": int(df['Release Year'].min()),
            "max_year": int(df['Release Year'].max())
        }
    return {"min_year": 1900, "max_year": 2025}

@app.get("/filters/ratings")
def get_rating_range():
    """Get min and max IMDB ratings."""
    if 'IMDB Rating' in df.columns:
        return {
            "min_rating": float(df['IMDB Rating'].min()),
            "max_rating": float(df['IMDB Rating'].max())
        }
    return {"min_rating": 0.0, "max_rating": 10.0}

@app.post("/filter")
def filter_data(request: FilterRequest):
    """Apply filters to the dataset."""
    try:
        filtered_df = df.copy()

        # Apply column selection
        if request.selected_columns:
            filtered_df = filtered_df[request.selected_columns]

        # Apply genre filter
        if request.selected_genres and 'Genre' in filtered_df.columns:
            filtered_df = filtered_df[filtered_df['Genre'].isin(request.selected_genres)]

        # Apply year range filter
        if request.year_range and 'Release Year' in filtered_df.columns:
            filtered_df = filtered_df[
                (filtered_df['Release Year'] >= request.year_range[0]) &
                (filtered_df['Release Year'] <= request.year_range[1])
            ]

        # Apply rating range filter
        if request.rating_range and 'IMDB Rating' in filtered_df.columns:
            filtered_df = filtered_df[
                (filtered_df['IMDB Rating'] >= request.rating_range[0]) &
                (filtered_df['IMDB Rating'] <= request.rating_range[1])
            ]

        return {
            "data": filtered_df.to_dict('records'),
            "count": len(filtered_df)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/analyze", response_model=AnalyzeResponse)
def analyze_data(request: AnalyzeRequest):
    """Analyze filtered data based on user question."""
    try:
        # Convert dict back to DataFrame
        filtered_df = pd.DataFrame(request.filtered_data)

        # Get schema
        schema = get_dataframe_schema(filtered_df)

        # Step 1: Generate code
        generated_code = generate_code(request.question, schema)

        # Step 2: Execute code
        result = execute_code(generated_code, filtered_df)

        # Step 3: Interpret result
        interpretation = interpret_result(result, request.question)

        return AnalyzeResponse(
            generated_code=generated_code,
            execution_output=result,
            interpretation=interpretation
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
