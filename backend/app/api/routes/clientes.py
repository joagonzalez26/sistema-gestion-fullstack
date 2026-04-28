import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import col, func, select

from app import crud
from app.api.deps import CurrentUser, SessionDep
from app.models import Client, ClientCreate, ClientPublic, ClientsPublic, ClientUpdate, Message

router = APIRouter(prefix="/clientes", tags=["clientes"])


@router.get("/", response_model=ClientsPublic)
def read_clients(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve clients.
    """
    if current_user.is_superuser:
        count_statement = select(func.count()).select_from(Client)
        count = session.exec(count_statement).one()
        statement = (
            select(Client)
            .order_by(col(Client.created_at).desc())
            .offset(skip)
            .limit(limit)
        )
        clients = session.exec(statement).all()
    else:
        count_statement = (
            select(func.count())
            .select_from(Client)
            .where(Client.owner_id == current_user.id)
        )
        count = session.exec(count_statement).one()
        statement = (
            select(Client)
            .where(Client.owner_id == current_user.id)
            .order_by(col(Client.created_at).desc())
            .offset(skip)
            .limit(limit)
        )
        clients = session.exec(statement).all()

    clients_public = [ClientPublic.model_validate(client) for client in clients]
    return ClientsPublic(data=clients_public, count=count)


@router.get("/{id}", response_model=ClientPublic)
def read_client(
    session: SessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Any:
    """
    Get client by ID.
    """
    client = session.get(Client, id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    if not current_user.is_superuser and (client.owner_id != current_user.id):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return client


@router.post("/", response_model=ClientPublic)
def create_client(
    *, session: SessionDep, current_user: CurrentUser, client_in: ClientCreate
) -> Any:
    """
    Create new client.
    """
    client = crud.create_client(
        session=session, client_in=client_in, owner_id=current_user.id
    )
    return client


@router.put("/{id}", response_model=ClientPublic)
def update_client(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    client_in: ClientUpdate,
) -> Any:
    """
    Update a client.
    """
    client = session.get(Client, id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    if not current_user.is_superuser and (client.owner_id != current_user.id):
        raise HTTPException(status_code=403, detail="Not enough permissions")

    client = crud.update_client(session=session, db_client=client, client_in=client_in)
    return client


@router.delete("/{id}", response_model=Message)
def delete_client(
    session: SessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Message:
    """
    Delete a client.
    """
    client = session.get(Client, id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    if not current_user.is_superuser and (client.owner_id != current_user.id):
        raise HTTPException(status_code=403, detail="Not enough permissions")

    session.delete(client)
    session.commit()
    return Message(message="Client deleted successfully")