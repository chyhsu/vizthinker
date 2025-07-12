import logging
import sys

def setup_logger():
    """Set up the application's logger."""
    logger = logging.getLogger("VizThinker")
    logger.setLevel(logging.INFO)

    # Create a handler to write logs to stdout
    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(logging.INFO)

    # Create a formatter and set it for the handler
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s (%(filename)s:%(lineno)d)'
    )
    handler.setFormatter(formatter)

    # Add the handler to the logger
    # Avoid adding handlers multiple times
    if not logger.handlers:
        logger.addHandler(handler)

    return logger

# Create a logger instance to be imported by other modules
logger = setup_logger()
