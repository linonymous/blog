---
title: "A Case Study on Amazon's Dynamo"
date: 2019-08-15
description: "Exploring the design and implementation of Dynamo, Amazon's highly available key-value store"
tags: ["distributed-systems", "databases", "amazon", "dynamo", "paper-review"]
slug: "amazon-dynamo-case-study"
draft: false
---

The Dynamo paper highlights the design and implementation of Dynamo, a highly available key-value store that some of Amazon's core services use to provide a seamless user experience.

## Why Not RDBMS?

Most of Amazon's services only need to:
- Store and retrieve data by primary key
- No complex querying required

Thus, RDBMS as a solution seems hefty. A simpler, more focused solution was needed.

## Performance Requirements

Dynamo is designed for **latency-sensitive applications** that require:
- 99.9% of read and write operations completed in a few hundred milliseconds
- Always-on availability
- Predictable performance at scale

## Core Design Principles

### 1. Incremental Scalability

Dynamo should scale horizontally, with one node at a time, with minimal impact on the system.

### 2. Symmetry

Every node in the environment shares the same set of responsibilities. No nodes have specialized roles, leading to simplification of provisioning and maintenance.

### 3. Decentralization

The design uses decentralized peer-to-peer techniques over centralized control. This eliminates single points of failure and improves resilience.

### 4. Simple Interface

Dynamo provides a simple key-value interface:
- `get(key)` — returns the object or list of conflicting versions
- `put(key, context, value)` — stores the value

## Key Techniques

### Consistent Hashing

Dynamo's partitioning relies on **consistent hashing** to distribute the load across multiple storage hosts.

- A ring of hash space is formed
- Each node is responsible for the region between it and its predecessor
- Virtual nodes allow better load distribution

### Vector Clocks

For conflict detection and resolution, Dynamo uses vector clocks to track causality between different versions of data.

### Quorum-based Consistency

Dynamo uses configurable quorum parameters:
- **N**: Number of replicas
- **R**: Minimum reads for success
- **W**: Minimum writes for success

This allows tuning between consistency and availability based on application needs.

### Gossip Protocol

Nodes use gossip protocols to:
- Detect failures
- Share membership information
- Propagate configuration changes

### Merkle Trees

For anti-entropy and synchronization, Dynamo uses Merkle trees to efficiently detect inconsistencies between replicas.

## Trade-offs

Dynamo explicitly chooses:
- **Availability over Consistency** (AP in CAP theorem)
- **Eventual Consistency** model
- **Client-side conflict resolution** when needed

## Impact

Dynamo's design influenced many modern distributed databases:
- Apache Cassandra
- Amazon DynamoDB
- Riak
- Voldemort

---

*The Dynamo paper is essential reading for anyone interested in distributed systems. It demonstrates how to build highly available systems at scale.*
