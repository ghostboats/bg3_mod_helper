try:
    # Check if Wand package is installed
    import wand
except ImportError:
    print("Wand not installed")
    exit()

# Separate check for ImageMagick
try:
    # Check if Wand image module works (requires ImageMagick)
    import wand.image
    print("Wand and ImageMagick are installed")
except ImportError:
    print("ImageMagick not installed")
