from PIL import Image, ImageDraw, ImageFilter
import math
import numpy as np

def create_water_bubble(size=400, filename='water_bubble.png'):
    """Create a realistic water/glass bubble with refraction effects."""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    center = size // 2
    radius = size // 2 - 10
    
    # Create gradient for main bubble body
    for y in range(size):
        for x in range(size):
            dx = x - center
            dy = y - center
            dist = math.sqrt(dx * dx + dy * dy)
            
            if dist <= radius:
                # Normalized distance from center (0 at center, 1 at edge)
                nd = dist / radius
                
                # Create water refraction effect - brighter at edges, darker in center
                # with caustic light patterns
                
                # Base color - very light mint/cyan with transparency
                alpha = int(180 * (1 - nd * 0.3))  # More opaque at center
                
                # Caustic highlights - bright areas where light would refract
                caustic = math.sin(nd * math.pi * 3) * 0.5 + 0.5
                caustic2 = math.sin((dx * 0.05) + (dy * 0.03)) * 0.3 + 0.7
                
                # Glass edge highlight
                edge_highlight = 1.0 if nd > 0.85 else 0.0
                
                # Specular highlight (top-left)
                spec_x = center - radius * 0.3
                spec_y = center - radius * 0.3
                spec_dist = math.sqrt((x - spec_x) ** 2 + (y - spec_y) ** 2)
                specular = max(0, 1 - spec_dist / (radius * 0.25))
                specular = specular ** 3  # Sharpen
                
                # Secondary specular (bottom-right, fainter)
                spec2_x = center + radius * 0.4
                spec2_y = center + radius * 0.4
                spec2_dist = math.sqrt((x - spec2_x) ** 2 + (y - spec2_y) ** 2)
                specular2 = max(0, 1 - spec2_dist / (radius * 0.3)) * 0.3
                
                # Combine colors
                base_r = 200 + int(55 * caustic * caustic2)
                base_g = 240 + int(15 * caustic * caustic2)
                base_b = 230 + int(25 * caustic * caustic2)
                
                # Apply edge brightening
                if nd > 0.85:
                    edge_factor = (nd - 0.85) / 0.15
                    base_r = int(base_r + 55 * edge_factor)
                    base_g = int(base_g + 15 * edge_factor)
                    base_b = int(base_b + 25 * edge_factor)
                
                # Apply specular
                base_r = min(255, int(base_r + 255 * specular))
                base_g = min(255, int(base_g + 255 * specular))
                base_b = min(255, int(base_b + 255 * specular))
                
                base_r = min(255, int(base_r + 200 * specular2))
                base_g = min(255, int(base_g + 200 * specular2))
                base_b = min(255, int(base_b + 200 * specular2))
                
                # Inner shadow/darkening at very edge
                if nd > 0.95:
                    dark_factor = (nd - 0.95) / 0.05
                    base_r = int(base_r * (1 - dark_factor * 0.3))
                    base_g = int(base_g * (1 - dark_factor * 0.3))
                    base_b = int(base_b * (1 - dark_factor * 0.3))
                
                img.putpixel((x, y), (base_r, base_g, base_b, alpha))
    
    # Add strong outer glow/highlight ring
    glow = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    for i in range(5):
        offset = i * 2
        alpha = 80 - i * 15
        glow_draw.ellipse(
            [center - radius - offset, center - radius - offset,
             center + radius + offset, center + radius + offset],
            outline=(255, 255, 255, alpha)
        )
    
    img = Image.alpha_composite(img, glow)
    
    # Apply slight blur for glass effect
    img = img.filter(ImageFilter.GaussianBlur(radius=1))
    
    img.save(filename, 'PNG')
    print(f"Created {filename}")

def create_water_swirl(size=400, filename='water_swirl.png'):
    """Create a flowing water swirl/ribbon decoration."""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    
    center = size // 2
    
    # Create a flowing ribbon shape using bezier-like curves
    for y in range(size):
        for x in range(size):
            # Create swirling pattern
            dx = x - center
            dy = y - center
            dist = math.sqrt(dx * dx + dy * dy)
            angle = math.atan2(dy, dx)
            
            # Swirl function
            swirl = math.sin(angle * 2 + dist * 0.05) * 0.5 + 0.5
            ribbon = math.sin(angle * 3 + dist * 0.03) * math.cos(dist * 0.02)
            
            if abs(ribbon) > 0.3 and dist < radius * 1.2:
                alpha = int(150 * abs(ribbon) * (1 - dist / (radius * 1.2)))
                
                # Mint/cyan color
                r = int(180 + 75 * swirl)
                g = int(230 + 25 * swirl)
                b = int(220 + 35 * swirl)
                
                img.putpixel((x, y), (r, g, b, alpha))
    
    # Apply blur
    img = img.filter(ImageFilter.GaussianBlur(radius=2))
    
    # Add highlight
    highlight = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(highlight)
    
    # Draw flowing highlight lines
    for i in range(20):
        t = i / 20.0
        x1 = center + int(radius * 0.8 * math.cos(t * math.pi * 2))
        y1 = center + int(radius * 0.8 * math.sin(t * math.pi * 2))
        x2 = center + int(radius * 0.6 * math.cos(t * math.pi * 2 + 0.5))
        y2 = center + int(radius * 0.6 * math.sin(t * math.pi * 2 + 0.5))
        
        draw.line([(x1, y1), (x2, y2)], fill=(255, 255, 255, 100), width=2)
    
    img = Image.alpha_composite(img, highlight)
    img.save(filename, 'PNG')
    print(f"Created {filename}")

def create_water_gem(size=300, filename='water_gem.png'):
    """Create a faceted water gem/crystal."""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    center = size // 2
    radius = size // 2 - 15
    
    # Draw a diamond-like faceted shape
    points = []
    for i in range(8):
        angle = i * math.pi / 4 - math.pi / 8
        # Alternate between outer and inner radius for faceted look
        r = radius * 0.9 if i % 2 == 0 else radius * 0.6
        x = center + r * math.cos(angle)
        y = center + r * math.sin(angle)
        points.append((x, y))
    
    # Draw main gem body
    draw.polygon(points, fill=(200, 245, 235, 160))
    
    # Draw facets with different shades
    for i in range(8):
        p1 = points[i]
        p2 = points[(i + 1) % 8]
        p3 = (center, center)
        
        shade = 200 + (i % 3) * 20
        draw.polygon([p1, p2, p3], fill=(shade, 240, 230, 140))
    
    # Add specular highlight
    spec_x = center - radius * 0.2
    spec_y = center - radius * 0.3
    draw.ellipse([spec_x - 15, spec_y - 10, spec_x + 15, spec_y + 10], fill=(255, 255, 255, 200))
    
    # Add edge glow
    glow = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    for i in range(3):
        offset = i * 2
        alpha = 60 - i * 15
        # Draw polygon outline
        glow_points = []
        for j in range(8):
            angle = j * math.pi / 4 - math.pi / 8
            r = radius * 0.9 if j % 2 == 0 else radius * 0.6
            x = center + (r + offset) * math.cos(angle)
            y = center + (r + offset) * math.sin(angle)
            glow_points.append((x, y))
        glow_points.append(glow_points[0])
        for j in range(len(glow_points) - 1):
            glow_draw.line([glow_points[j], glow_points[j + 1]], fill=(255, 255, 255, alpha), width=2)
    
    img = Image.alpha_composite(img, glow)
    img = img.filter(ImageFilter.GaussianBlur(radius=1))
    img.save(filename, 'PNG')
    print(f"Created {filename}")

# Create output directory
import os
os.makedirs('assets/water', exist_ok=True)

radius = 180

print("Generating water bubble images...")
create_water_bubble(400, 'assets/water/water_bubble.png')
create_water_swirl(400, 'assets/water/water_swirl.png')
create_water_gem(300, 'assets/water/water_gem.png')

print("Done!")
