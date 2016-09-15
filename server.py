# -*- coding: utf-8 -*-
"""
Server to which clients connect to get updates on data embeddings.
It organizes computations and exposes a webosocket API.
"""

import json
import asyncio
from concurrent.futures import ThreadPoolExecutor
from numpy import random
import websockets

from embedding import tsne, mappers
from data import s_buffer, stream

executor = ThreadPoolExecutor(max_workers=10)


# updates for mapping learners are triggered by a new tSNE
needs_remapping = asyncio.Event()


async def compute_tsne():
    while True:
        print("[compute_tsne] start")
        X, index_first = s_buffer.X()
        X_2d = await loop.run_in_executor(executor, tsne, X)
        updates = s_buffer.update2d(X_2d, index_first)
        broadcast(json.dumps({
            "status": "update",
            "samples": updates,
        }))
        needs_remapping.set()
        print("[compute_tsne] done")
        await asyncio.sleep(10) # debug

async def compute_mappers():
    while True:
        print("[compute_mappers] start")
        s_buffer.mapper_x, s_buffer.mapper_y = \
            await loop.run_in_executor(executor,
                                       mappers,
                                       s_buffer.X()[0],
                                       s_buffer.X_2d())
        needs_remapping.clear()
        print("[compute_mappers] done")
        updates = s_buffer.update_xys(mapper_x, mapper_y)
        broadcast(json.dumps({
            "status":"update",
            "samples": updates,
        }))
        await needs_remapping.wait()


async def in_stream():
    """ Simulate a stream of incomming data and buffers it. """
    for s in stream: # we fake it...
        await asyncio.sleep(random.exponential())
        new = s_buffer.extend(s, mapper_x, mapper_y)
        broadcast(json.dumps({
            "status":"new",
            "samples": new,
        }))
        s_buffer.remove_old(60*10)


def broadcast(message):
    """ Send a message to all connected clients. """
    if connected:
        tasks = asyncio.wait([ws.send(message) for ws in connected])
        asyncio.ensure_future(tasks)


async def handler(websocket, path):
    """ Handle a websocket connection. """
    connected.add(websocket)
    try:
        # send the buffer's content to new clients
        await websocket.send(json.dumps({
            'status':'load',
            'samples': s_buffer.to_dict(),
        }))
        while True:
            await asyncio.sleep(10)
    finally:
        connected.remove(websocket)


if __name__ == '__main__':
    X, index_first = s_buffer.X()
    X_2d = tsne(X)
    s_buffer.update2d(X_2d, index_first)
    mapper_x, mapper_y = mappers(X, X_2d)
    print("[init] done")

    connected = set()
    start_server = websockets.serve(handler, '0.0.0.0', 8765)
    loop = asyncio.get_event_loop()
    tasks = [
        asyncio.ensure_future(in_stream()),
        asyncio.ensure_future(compute_mappers()),
        asyncio.ensure_future(compute_tsne()),
        start_server,
    ]
    loop.run_until_complete(asyncio.gather(*tasks))
    loop.close()
