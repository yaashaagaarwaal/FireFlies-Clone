# Explicit Docker build so the deploy platform never has to guess the
# Python version or how to run this app — removes an entire class of
# "auto-detected the wrong thing" build failures.
FROM python:3.12-slim

# Unbuffered stdout/stderr so logs show up in Railway's log viewer in real
# time instead of arriving in delayed chunks.
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Installed before the rest of the code so this layer is cached across
# deploys unless requirements.txt itself changes.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
RUN chmod +x scripts/start.sh

EXPOSE 8001

CMD ["bash", "scripts/start.sh"]
