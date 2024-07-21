from PIL import Image, ImageDraw
import os

def create_wipe_animation(base_image_path, output_gif_path, num_frames=100, duration=5):
    # Load the base image
    base_image = Image.open(base_image_path)
    width, height = base_image.size
    
    # Generate frames for the wipe animation
    frames = []
    for frame in range(num_frames):
        progress = frame / num_frames
        wipe_width = int(width * progress)
        
        # Create a new image for the frame
        frame_image = Image.new('RGB', (width, height), (30, 30, 46))
        draw = ImageDraw.Draw(frame_image)
        
        # Paste the portion of the base image corresponding to the wipe progress
        frame_image.paste(base_image.crop((0, 0, wipe_width, height)), (0, 0))
        
        # Append the frame to the list of frames
        frames.append(frame_image)

    for frame in range(num_frames * 2):
        frames.append(base_image)
    
    # Generate frames for the reverse wipe animation
    for frame in range(num_frames):
        progress = frame / num_frames
        wipe_width = int(width * (1 - progress))
        
        # Create a new image for the frame
        frame_image = Image.new('RGB', (width, height), (30, 30, 46))
        draw = ImageDraw.Draw(frame_image)
        
        # Paste the portion of the base image corresponding to the reverse wipe progress
        frame_image.paste(base_image.crop((0, 0, width - wipe_width, height)), (0, 0))
        
        # Append the frame to the list of frames
        frames.append(frame_image)
    
    # Save the frames as a GIF
    frames[0].save(
        output_gif_path,
        save_all=True,
        append_images=frames[1:],
        duration=(duration * 3000) / (4 * num_frames),
        loop=0
    )

create_wipe_animation('batch-3/wallpaper-3.png', 'wipe_animation.gif', num_frames=120, duration=5)
