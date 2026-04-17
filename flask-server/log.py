import logging
import sys

LOG_FILE = "important-logs.txt"

_logger = None

def get_logger():
    global _logger
    if _logger is not None:
        return _logger

    _logger = logging.getLogger("uptonair")
    _logger.setLevel(logging.DEBUG)

    if not _logger.handlers:
        formatter = logging.Formatter(
            fmt="[%(asctime)s] %(levelname)s %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )

        # File handler — append to important-logs.txt
        try:
            file_handler = logging.FileHandler(LOG_FILE, encoding="utf-8")
            file_handler.setLevel(logging.DEBUG)
            file_handler.setFormatter(formatter)
            _logger.addHandler(file_handler)
        except Exception as e:
            print(f"Failed to open log file: {e}", file=sys.stderr)

        # Stderr handler
        stderr_handler = logging.StreamHandler(sys.stderr)
        stderr_handler.setLevel(logging.DEBUG)
        stderr_handler.setFormatter(formatter)
        _logger.addHandler(stderr_handler)

    return _logger


def log(message):
    """Backward-compatible single-string log call."""
    get_logger().info(message)
