import gspread
import os
import csv
from google.oauth2.service_account import Credentials

# Get service account JSON from environment variable
sa_json = os.environ['GOOGLE_SA_KEY']

# Write the JSON to a temporary file (gspread needs a file)
with open('temp_sa.json', 'w') as f:
    f.write(sa_json)

# Authenticate with Google Sheets
creds = Credentials.from_service_account_file('temp_sa.json', scopes=[
    'https://www.googleapis.com/auth/spreadsheets.readonly'
])
gc = gspread.authorize(creds)

# Replace with your Google Sheet ID
SHEET_ID = '1Hw0rLtPxbftxwbn0XkzYPqAh7r6bfbRGVkeF-3DlSTE'

sheet = gc.open_by_key(SHEET_ID).sheet1  # first sheet
data = sheet.get_all_values()

# Save to CSV in the repo
with open('Head2Head.csv', 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerows(data)
