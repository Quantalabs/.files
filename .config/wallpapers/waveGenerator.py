import numpy as np
import matplotlib.pyplot as plt
import matplotlib.colors as mcolors

def generate_wave_image(num_waves=10, base_amplitude=1.0, decay_factor=0.9, offset=0.1, color1='#D69EFF', color2='#8BD9FF', filename='wave_image.png', x_min=0, x_max=5 * np.pi):
    # Create a figure and axis
    fig, ax = plt.subplots(figsize=(12, 6))
    
    # Generate x values
    x = np.linspace(0, 5 * np.pi, 1000)
    
    # Create gradient color
    colors = [mcolors.to_rgba(color1), mcolors.to_rgba(color2)]
    cmap = mcolors.LinearSegmentedColormap.from_list('gradient', colors)
    
    # Base sine wave with random frequency and phase
    def generate_wave(x, amplitude):
        y = np.zeros_like(x)
        for _ in range(5):  # Sum of multiple sine waves
            freq = np.random.uniform(0.5, 1.5)
            phase = np.random.uniform(0, 2 * np.pi)
            y += amplitude * np.sin(freq * x + phase)
        # Normalize y values to stay within the amplitude range
        y = amplitude * y / np.max(np.abs(y))
        return y
    
    # Generate the initial sine wave
    y = generate_wave(x, base_amplitude)
    
    # Find the indices corresponding to the specified domain
    domain_indices = np.where((x >= x_min) & (x <= x_max))[0]
    
    # Generate and plot the initial sine wave with gradient color within the domain
    for i in range(len(domain_indices) - 1):
        idx1, idx2 = domain_indices[i], domain_indices[i + 1]
        ax.plot(x[idx1:idx2+1], y[idx1:idx2+1], color=cmap(i / len(domain_indices)), linewidth=1)
    
    # Generate and plot subsequent waves with reduced peaks and offsets within the domain
    y_1 = y
    x_1 = x
    for j in range(1, int(np.ceil(num_waves/2))):  # Number of waves
        y = decay_factor * y
        x = x + offset
        y_1 = y_1 / decay_factor
        x_1 = x_1 - offset
        
        # Update the domain indices for the shifted x values
        domain_indices = np.where((x >= x_min) & (x <= x_max))[0]
        
        for i in range(len(domain_indices) - 1):
            idx1, idx2 = domain_indices[i], domain_indices[i + 1]
            ax.plot(x[idx1:idx2+1], y[idx1:idx2+1], color=cmap(i / len(domain_indices)), linewidth=1)
        
        # Update the domain indices for the shifted x_1 values
        domain_indices = np.where((x_1 >= x_min) & (x_1 <= x_max))[0]
        
        for i in range(len(domain_indices) - 1):
            idx1, idx2 = domain_indices[i], domain_indices[i + 1]
            ax.plot(x_1[idx1:idx2+1], y_1[idx1:idx2+1], color=cmap(i / len(domain_indices)), linewidth=1)
    
    # Set the x-axis limits
    ax.set_xlim(x_min, x_max)
    
    # Set the background color
    fig.patch.set_facecolor('#1e1e2e')
    ax.set_facecolor('#1e1e2e')
    
    # Remove axes
    ax.axis('off')
    
    # Save the image
    plt.savefig(filename, bbox_inches='tight', pad_inches=0, dpi=300)
    plt.close()

# Example usage
generate_wave_image(num_waves=25, base_amplitude=1.5, decay_factor=0.9, offset=0.05, color1='#D69EFF', color2='#8BD9FF', filename='wave_image.png', x_min=2 * np.pi, x_max=4 * np.pi)
