class EmailDeliveryError(Exception):
    """Error al entregar el correo vía proveedor externo."""

    def __init__(self, message: str = "No se pudo enviar el correo.") -> None:
        super().__init__(message)
        self.message = message
