from datetime import datetime, timezone
from extensions import db


class FavouriteDevice(db.Model):
    """A device a user starred in the Device browser, by serial.

    Keyed by user rather than organisation: the app is built for one organisation,
    and its users each keep their own list. user_key is resolved from /loginInfo
    (see _get_user_key in app.py).
    """
    __tablename__ = 'favourite_devices'

    id = db.Column(db.Integer, primary_key=True)
    user_key = db.Column(db.String(255), nullable=False, index=True)
    serial = db.Column(db.String(64), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        db.UniqueConstraint('user_key', 'serial', name='uq_user_device'),
    )
