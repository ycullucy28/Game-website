#!/usr/bin/env python3
"""Generate original chiptune-style game audio (WAV)."""

import math
import struct
import wave
from pathlib import Path

SAMPLE_RATE = 22050
OUTPUT_DIR = Path(__file__).resolve().parent.parent / "audio"

NOTE = {
    "A3": 220.0,
    "F3": 174.61,
    "G3": 196.0,
    "C4": 261.63,
    "D4": 293.66,
    "E4": 329.63,
    "F4": 349.23,
    "G4": 392.0,
    "A4": 440.0,
    "B4": 493.88,
    "C5": 523.25,
    "D5": 587.33,
    "E5": 659.25,
    "F5": 698.46,
    "G5": 783.99,
    "A5": 880.0,
    "B5": 987.77,
    "C6": 1046.5,
    "REST": 0.0,
}


def clamp(value):
    return max(-1.0, min(1.0, value))


def square_wave(phase):
    return 1.0 if math.sin(phase) >= 0 else -1.0


def triangle_wave(phase):
    return (2 / math.pi) * math.asin(math.sin(phase))


def envelope(length, position, attack=0.01, release=0.08):
    attack_samples = int(SAMPLE_RATE * attack)
    release_samples = int(SAMPLE_RATE * release)

    if position < attack_samples:
        return position / max(attack_samples, 1)
    if position > length - release_samples:
        return max(0.0, (length - position) / max(release_samples, 1))
    return 1.0


def render_note(freq, duration, wave_fn=square_wave, volume=0.22):
    length = int(SAMPLE_RATE * duration)
    samples = []

    for i in range(length):
        if freq <= 0:
            samples.append(0.0)
            continue

        phase = 2 * math.pi * freq * (i / SAMPLE_RATE)
        value = wave_fn(phase) * envelope(length, i) * volume
        samples.append(clamp(value))

    return samples


def mix_tracks(tracks):
    max_len = max(len(track) for track in tracks)
    mixed = [0.0] * max_len

    for track in tracks:
        for i, sample in enumerate(track):
            mixed[i] += sample

    peak = max(abs(sample) for sample in mixed) or 1.0
    scale = 0.95 / peak if peak > 0.95 else 1.0
    return [clamp(sample * scale) for sample in mixed]


def sequence_notes(notes, default_duration=0.16, wave_fn=square_wave, volume=0.22):
    rendered = []

    for entry in notes:
        if isinstance(entry, tuple):
            pitch, duration = entry
        else:
            pitch, duration = entry, default_duration

        freq = NOTE.get(pitch, 0.0)
        rendered.extend(render_note(freq, duration, wave_fn=wave_fn, volume=volume))

    return rendered


def write_wav(path, samples):
    path.parent.mkdir(parents=True, exist_ok=True)

    with wave.open(str(path), "w") as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(SAMPLE_RATE)

        for sample in samples:
            wav_file.writeframes(struct.pack("<h", int(sample * 32767)))


def generate_move():
    return render_note(NOTE["A4"], 0.07, volume=0.18)


def generate_score():
    return sequence_notes(
        [("C5", 0.07), ("E5", 0.07), ("G5", 0.11), ("C6", 0.14)],
        wave_fn=triangle_wave,
        volume=0.24,
    )


def generate_game_over():
    return sequence_notes(
        [("G4", 0.18), ("E4", 0.18), ("C4", 0.18), ("REST", 0.06), ("A3", 0.35)],
        wave_fn=triangle_wave,
        volume=0.26,
    )


def generate_snake_theme_classic():
    melody = sequence_notes(
        [
            ("E4", 0.18),
            ("G4", 0.18),
            ("A4", 0.18),
            ("G4", 0.18),
            ("E4", 0.18),
            ("D4", 0.18),
            ("E4", 0.36),
            ("REST", 0.12),
            ("G4", 0.18),
            ("B4", 0.18),
            ("C5", 0.18),
            ("B4", 0.18),
            ("G4", 0.18),
            ("E4", 0.18),
            ("D4", 0.36),
            ("REST", 0.24),
        ],
        wave_fn=triangle_wave,
        volume=0.18,
    )

    bass = sequence_notes(
        [
            ("C4", 0.36),
            ("G4", 0.36),
            ("A4", 0.36),
            ("E4", 0.36),
            ("F4", 0.36),
            ("C4", 0.36),
            ("G4", 0.36),
            ("G4", 0.36),
        ],
        wave_fn=square_wave,
        volume=0.08,
    )

    return mix_tracks([melody, bass])


def generate_snake_theme_retro():
    melody = sequence_notes(
        [
            ("C5", 0.10),
            ("C5", 0.10),
            ("G4", 0.10),
            ("G4", 0.10),
            ("A4", 0.10),
            ("A4", 0.10),
            ("G4", 0.20),
            ("REST", 0.10),
            ("F4", 0.10),
            ("F4", 0.10),
            ("E4", 0.10),
            ("E4", 0.10),
            ("D4", 0.10),
            ("D4", 0.10),
            ("C4", 0.20),
            ("REST", 0.20),
        ],
        wave_fn=square_wave,
        volume=0.17,
    )

    pulse = sequence_notes(
        [
            ("C4", 0.10),
            ("REST", 0.10),
            ("C4", 0.10),
            ("REST", 0.10),
            ("G3", 0.10),
            ("REST", 0.10),
            ("G3", 0.10),
            ("REST", 0.10),
            ("A3", 0.10),
            ("REST", 0.10),
            ("A3", 0.10),
            ("REST", 0.10),
            ("G3", 0.20),
            ("REST", 0.10),
            ("F3", 0.10),
            ("REST", 0.10),
            ("F3", 0.10),
            ("REST", 0.10),
            ("C4", 0.10),
            ("REST", 0.10),
            ("C4", 0.10),
            ("REST", 0.10),
            ("G3", 0.10),
            ("REST", 0.10),
            ("G3", 0.10),
            ("REST", 0.10),
            ("C4", 0.20),
            ("REST", 0.20),
        ],
        wave_fn=square_wave,
        volume=0.07,
    )

    return mix_tracks([melody, pulse])


def generate_tetris_theme_classic():
    melody = sequence_notes(
        [
            ("E5", 0.14),
            ("B4", 0.14),
            ("C5", 0.14),
            ("D5", 0.14),
            ("C5", 0.14),
            ("B4", 0.14),
            ("A4", 0.14),
            ("A4", 0.07),
            ("C5", 0.07),
            ("E5", 0.14),
            ("D5", 0.14),
            ("C5", 0.14),
            ("B4", 0.14),
            ("B4", 0.07),
            ("C5", 0.07),
            ("D5", 0.14),
            ("E5", 0.14),
            ("C5", 0.14),
            ("A4", 0.14),
            ("A4", 0.28),
            ("REST", 0.14),
        ],
        wave_fn=square_wave,
        volume=0.16,
    )

    bass = sequence_notes(
        [
            ("A3", 0.28),
            ("E4", 0.28),
            ("F4", 0.28),
            ("C4", 0.28),
            ("G4", 0.28),
            ("G4", 0.28),
            ("E4", 0.28),
            ("A3", 0.28),
            ("A3", 0.28),
            ("E4", 0.28),
            ("F4", 0.28),
            ("C4", 0.28),
            ("G4", 0.28),
            ("G4", 0.28),
            ("E4", 0.28),
            ("A3", 0.28),
        ],
        wave_fn=triangle_wave,
        volume=0.09,
    )

    return mix_tracks([melody, bass])


def generate_tetris_theme_retro():
    melody = sequence_notes(
        [
            ("A4", 0.11),
            ("E5", 0.11),
            ("A5", 0.11),
            ("E5", 0.11),
            ("F5", 0.11),
            ("D5", 0.11),
            ("F5", 0.11),
            ("D5", 0.11),
            ("E5", 0.11),
            ("C5", 0.11),
            ("E5", 0.11),
            ("C5", 0.11),
            ("D5", 0.11),
            ("B4", 0.11),
            ("D5", 0.11),
            ("B4", 0.22),
            ("REST", 0.11),
        ],
        wave_fn=square_wave,
        volume=0.15,
    )

    bass = sequence_notes(
        [
            ("A3", 0.22),
            ("A3", 0.22),
            ("F4", 0.22),
            ("F4", 0.22),
            ("G4", 0.22),
            ("G4", 0.22),
            ("E4", 0.22),
            ("E4", 0.22),
            ("A3", 0.22),
            ("A3", 0.22),
            ("D4", 0.22),
            ("D4", 0.22),
            ("E4", 0.22),
            ("E4", 0.22),
            ("A3", 0.22),
            ("A3", 0.22),
            ("REST", 0.22),
        ],
        wave_fn=square_wave,
        volume=0.08,
    )

    return mix_tracks([melody, bass])


def main():
    files = {
        "move.wav": generate_move(),
        "score.wav": generate_score(),
        "game-over.wav": generate_game_over(),
        "snake-theme-classic.wav": generate_snake_theme_classic(),
        "snake-theme-retro.wav": generate_snake_theme_retro(),
        "tetris-theme-classic.wav": generate_tetris_theme_classic(),
        "tetris-theme-retro.wav": generate_tetris_theme_retro(),
    }

    for filename, samples in files.items():
        write_wav(OUTPUT_DIR / filename, samples)
        print(f"Wrote {OUTPUT_DIR / filename}")


if __name__ == "__main__":
    main()
