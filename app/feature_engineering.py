import pandas as pd

def add_features(df: pd.DataFrame) -> pd.DataFrame:

    df = df.copy()

    # 1) Salary per Experience
    df["Salary_per_Experience"] = (
        df["MonthlySalary"] / (df["Years_Experience"] + 1)
    )
    # df["Allowances_Ratio"]       = df["Allowances"] / (df["MonthlySalary"] + 1)

    # 2) Opportunity + Training interaction
    df["Opportunity_Training_Score"] = (
        df["Job_Opportunities"] *
        df["Training_programs_ During_last_three_years"]
    )

    # 3) Experience Gap vs Last Organization
    df["Experience_Gap_LastOrg"] = (
        df["Years_Experience"] -
        df["Years_experience_lastorganization"]
    )

    return df