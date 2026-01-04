---
title: "System Design #1: Designing Live Commenting"
date: 2021-08-15
description: "Designing systems that support live commenting like Facebook, Twitch, and YouTube live streams"
tags: ["system-design", "distributed-systems", "real-time"]
series: "System Design"
slug: "designing-live-commenting"
draft: false
---

Systems that support live commenting are everywhere — Facebook live commenting, Twitch/YouTube live stream commenting, and Reddit live stream commenting. Let's explore how to design such a system.

## The Challenge

Live commenting systems need to handle:

- **High write throughput**: Thousands of comments per second during peak events
- **Low latency reads**: Comments should appear almost instantly for all viewers
- **Scalability**: Handle millions of concurrent viewers
- **Eventual consistency**: Due to CAP theorem, we trade strict consistency — if a comment is made, it's okay if it takes a few seconds to appear everywhere else

## Core Components

### 1. API Layer

The API handles authorization with an API key, particularly a JWT token that is refreshed periodically. This ensures secure access to the commenting service.

### 2. Message Queue

To handle the high throughput of incoming comments, we use a message queue (like Kafka) to:
- Buffer incoming comments
- Ensure no comments are lost during traffic spikes
- Allow for async processing

### 3. Storage Layer

Comments are stored in a distributed database optimized for:
- Fast writes (append-only operations)
- Range queries (fetching comments for a specific stream/time window)
- Horizontal scaling

### 4. Real-time Delivery

For pushing comments to viewers, we can use:
- **WebSockets**: Persistent connections for bidirectional communication
- **Server-Sent Events (SSE)**: Simpler, one-way push from server to client
- **Long Polling**: Fallback for environments where WebSockets aren't supported

## Scaling Considerations

### Partitioning

Storing all data on a single node might increase query time. When working with large amounts of data, it needs to be distributed or partitioned across nodes to increase query throughput.

### Caching

Recent comments can be cached in Redis or Memcached to reduce database load and improve read latency.

### Rate Limiting

Implement rate limiting to prevent spam and protect the system from abuse.

## Trade-offs

The system is considered **eventually consistent** — if a comment is made, it's okay if it takes a few seconds to appear everywhere else. This trade-off allows us to:

- Scale horizontally more easily
- Handle network partitions gracefully
- Maintain high availability

---

*This is part of the System Design series where we explore the architecture of real-world systems.*
