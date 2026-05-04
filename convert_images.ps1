Add-Type -AssemblyName System.Drawing

$files = @('icon.png', 'adaptive-icon.png', 'splash-icon.png')

foreach ($file in $files) {
    $path = Join-Path $PSScriptRoot "assets\images\$file"
    Write-Host "Converting $path ..."

    $img = [System.Drawing.Image]::FromFile($path)

    $bmp = New-Object System.Drawing.Bitmap($img.Width, $img.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.DrawImage($img, 0, 0, $img.Width, $img.Height)
    $g.Dispose()
    $img.Dispose()

    $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()

    Write-Host "Done: $file"
}

Write-Host "All images converted to true PNG format!"
