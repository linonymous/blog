---
title: "Partitioning: Key Partitioning, Hash Partitioning and Request Routing"
date: 2019-04-20
description: "How data is distributed across nodes in distributed systems for scalability and performance"
tags: ["distributed-systems", "databases", "partitioning", "scalability"]
slug: "partitioning"
draft: false
---

In distributed systems, data is replicated on other nodes for resiliency and fault tolerance. But storing all data on a single node might affect query throughput, so data needs to be distributed or **partitioned** across nodes.

## The Problem: Hot Spots

A node having all the data is often known as a **"hot-spot"**. This creates:

- High query latency
- Single point of failure for read performance
- Inability to scale horizontally

The solution? Distribute data across multiple nodes strategically.

## Key-Range Partitioning

In key-range partitioning, data of a particular key-range is stored on a particular node.

### How It Works

- Keys are distributed across nodes, specific to the node with matching key-range
- Nodes with a particular key-range serve queries for only those keys
- This helps distribute queries and increase throughput

### Pros
- Efficient range queries
- Simple to understand and implement
- Good for sequential access patterns

### Cons
- Can lead to uneven distribution if key distribution is skewed
- Hot spots can still occur if certain key ranges are accessed more frequently

## Hash Partitioning

To achieve more even distribution, we can hash the keys.

### How It Works

- Apply a hash function to each key
- Use the hash value to determine which partition/node stores the data
- This spreads data more uniformly across nodes

### Pros
- More even data distribution
- Reduces hot spots
- Works well for random access patterns

### Cons
- Range queries become expensive (need to query all partitions)
- Rehashing needed when adding/removing nodes

## Consistent Hashing

A refinement of hash partitioning used in systems like Dynamo:

- Forms a ring of hash space
- Each node is responsible for a portion of the ring
- When nodes are added/removed, only nearby keys need to be moved

## Request Routing

Once data is partitioned, clients need to know which node to query:

### Approaches

1. **Client-side routing**: Client knows the partition map
2. **Coordinator node**: A proxy routes requests to correct partition
3. **Gossip protocol**: Nodes share partition information with each other

## Conclusion

Partitioning is fundamental to building scalable distributed systems. The choice between key-range and hash partitioning depends on your access patterns:

- Use **key-range** for sequential/range queries
- Use **hash partitioning** for uniform distribution and random access
- Consider **consistent hashing** for dynamic cluster membership

---

*In distributed systems, the answer is always "it depends" — but now you know what it depends on.*
