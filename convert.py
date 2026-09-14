import markdown

with open("report.md", "r") as f:
    text = f.read()

html = markdown.markdown(text, extensions=['tables'])

full_html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Mini Project Report</title>
<link rel="stylesheet" href="report.css">
</head>
<body>
{html}
</body>
</html>
"""

with open("report.html", "w") as f:
    f.write(full_html)
