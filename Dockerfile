# Backend Django + gunicorn (produccion). Build:  docker build -t cronos-api .
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
# collectstatic no necesita secretos reales; se usa un valor de relleno solo durante el build.
RUN DEBUG=false DJANGO_SECRET_KEY=build-only-not-a-secret DJANGO_ALLOWED_HOSTS=build \
    DATABASE_URL=postgres://u:p@localhost/db python manage.py collectstatic --noinput

RUN useradd --create-home --uid 10001 app && chown -R app /app
USER app
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD python -c "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://127.0.0.1:8000/healthz/').status==200 else 1)" || exit 1

CMD ["gunicorn", "cronos_elite.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3", "--access-logfile", "-", "--error-logfile", "-"]
