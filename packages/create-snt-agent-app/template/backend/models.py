from datetime import datetime, timezone
from extensions import db


class FavouriteOrganisation(db.Model):
    __tablename__ = 'favourite_organisations'

    id = db.Column(db.Integer, primary_key=True)
    user_key = db.Column(db.String(255), nullable=False, index=True)
    org_id = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        db.UniqueConstraint('user_key', 'org_id', name='uq_user_org'),
    )


class OrgDailyStat(db.Model):
    __tablename__ = 'org_daily_stats'

    id = db.Column(db.Integer, primary_key=True)
    org_id = db.Column(db.Integer, nullable=False, index=True)
    org_name = db.Column(db.String(255))
    snapshot_date = db.Column(db.Date, nullable=False, index=True)
    tracker_count = db.Column(db.Integer, nullable=False, default=0)
    user_count = db.Column(db.Integer, nullable=False, default=0)
    captured_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        db.UniqueConstraint('org_id', 'snapshot_date', name='uq_org_day'),
    )
