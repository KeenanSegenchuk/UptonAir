import numpy as np
import scipy.io.wavfile as wav
import matplotlib.pyplot as plt
import sys

# Function to generate and display the spectrogram
def plot_spectrogram(filename):
    # Read the .wav file
    sample_rate, data = wav.read(filename)

    # If stereo, we only take one channel (mono)
    if len(data.shape) > 1:
        data = data[:, 0]

    # Compute the spectrogram
    Pxx, freqs, bins, im = plt.specgram(data, Fs=sample_rate, NFFT=1024, noverlap=512, scale='dB', sides='default', mode='default')

    # Print spectral analysis
    print(f"Pixels: {Pxx}")
    print(f"Frequencies: {freqs}")
    print(f"Bins: {bins}")
    print(f"Img: {im}")

    freq_ticks = [1, float(1/7), float(1/365.25)]

    # Set labels and title
    plt.title(f'Spectrogram of {filename}')
    plt.xlabel('Time [s]')
    plt.ylabel('Frequency [Hz]')
    plt.yticks(freq_ticks, ["1/day hz", "1/month hz", "1/year hz"])

    # Show the plot
    plt.colorbar(label='Intensity [dB]')
    plt.show()

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python spectrogram.py <filename>")
        sys.exit(1)

    filename = sys.argv[1]
    try:
        plot_spectrogram(filename)
    except Exception as e:
        print(f"Error: {e}")