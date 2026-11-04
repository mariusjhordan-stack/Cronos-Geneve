from django.core.exceptions import ValidationError


class PasswordComplexityValidator:
    """Require an ASCII uppercase, lowercase, digit and non-alphanumeric symbol."""

    def validate(self, password, user=None):
        errors = []
        if not any('A' <= char <= 'Z' for char in password):
            errors.append('La contraseña debe contener al menos una mayúscula.')
        if not any('a' <= char <= 'z' for char in password):
            errors.append('La contraseña debe contener al menos una minúscula.')
        if not any('0' <= char <= '9' for char in password):
            errors.append('La contraseña debe contener al menos un número.')
        if not any(
            not char.isspace() and (not char.isascii() or not char.isalnum())
            for char in password
        ):
            errors.append('La contraseña debe contener al menos un símbolo especial.')
        if errors:
            raise ValidationError(errors)

    def get_help_text(self):
        return 'Incluya una mayúscula, una minúscula, un número y un símbolo especial.'
