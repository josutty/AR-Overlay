with open(r'c:\Projects\React\AR\src\components\FileUploadScreen.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the end of the clean component: last `}` preceded by `  )\n`
# The clean component ends at the first `}` on line 69
# We keep everything up to and including the first `}` after `  )\n`
idx = content.rfind('\n}')
if idx != -1:
    clean = content[:idx+2]  # include the `}\n` ... actually just `\n}`
    # But we want `}\n` at end, so add newline
    clean = content[:idx+2]
else:
    clean = content

# Write the clean version
with open(r'c:\Projects\React\AR\src\components\FileUploadScreen.jsx', 'w', encoding='utf-8') as f:
    f.write(clean)
    f.write('\n')

print("Done, wrote", len(clean), "chars")
