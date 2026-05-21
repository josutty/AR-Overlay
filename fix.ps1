$path = 'c:\Projects\React\AR\src\components\FileUploadScreen.jsx'
$content = Get-Content $path -Raw -Encoding UTF8
$idx = $content.LastIndexOf("`n}")
if ($idx -ge 0) {
    $clean = $content.Substring(0, $idx + 2)
    [System.IO.File]::WriteAllText($path, $clean + "`n", [System.Text.Encoding]::UTF8)
    Write-Host "Done. File truncated at position $idx"
} else {
    Write-Host "Pattern not found"
}
