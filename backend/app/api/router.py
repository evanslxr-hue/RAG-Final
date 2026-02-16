from fastapi import APIRouter

from app.api.routes import chat, collections, documents, exports, jobs, study, summary

api_router = APIRouter()
api_router.include_router(collections.router)
api_router.include_router(documents.router)
api_router.include_router(jobs.router)
api_router.include_router(chat.router)
api_router.include_router(summary.router)
api_router.include_router(study.router)
api_router.include_router(exports.router)
