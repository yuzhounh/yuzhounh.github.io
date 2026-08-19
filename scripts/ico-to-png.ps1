param(
  [Parameter(Mandatory = $true)][string]$IcoPath,
  [Parameter(Mandatory = $true)][string]$PngPath
)

Add-Type -AssemblyName System.Drawing
$icon = New-Object System.Drawing.Icon($IcoPath)
$bitmap = $icon.ToBitmap()
$bitmap.Save($PngPath, [System.Drawing.Imaging.ImageFormat]::Png)
$icon.Dispose()
$bitmap.Dispose()
