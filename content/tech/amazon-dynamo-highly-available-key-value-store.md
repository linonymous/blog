---
title: "A Case Study on Dynamo: Highly Available Key-Value Store by Amazon"
date: 2019-08-10
description: "Deep dive into Amazon's Dynamo paper - understanding the design principles behind a highly available, eventually consistent key-value store"
tags: ["distributed-systems", "databases", "amazon", "system-design", "dynamo"]
---

How e-commerce giants like **Amazon**, **eBay** scale? was the question I had for a long time. And meanwhile, I stumbled upon this amazing [paper](https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf) by Amazon. The paper highlights the design and implementation of Dynamo, a highly available key-value store that some of Amazon's core services use to provide a seamless user experience.

When it comes to building applications at large scale, **Reliability** and **scalability** are the biggest challenges these services face in their day-to-day business. Amazon operates on an infrastructure of tens of thousands of servers and networking components located across many data centers worldwide. Designing such applications starts right from the understanding of the requirements and objectives of the business.

## Requirements

- Dynamo is mainly for **applications** that need an '**always writable**' datastore where no updates are rejected due to failures or concurrent writes.
- Dynamo is built for infrastructure within a single administrative domain where all nodes are assumed to be trusted.
- Applications that use Dynamo do not require support for the complex relational schema.
- Dynamo is designed for latency-sensitive applications that require **99.9% read** and **writes** to be performed in a few hundred milliseconds.

As an e-commerce website, read requests are obviously going to be large in numbers than write requests. Thus, the objectives.

## Why Dynamo?

- Amazon's e-commerce infrastructure is composed of hundreds of services that work together to deliver the features right from giving recommendations to order fulfillment.
- Some of these services are stateless (services that do not depend upon any previously-stored state) and some of the services are stateful (services that prepare a result after performing some operations on its state stored in persistent store)
- Most of these services only store and retrieve data by primary key and do not require any complex querying. Thus, RDBMS as a solution seems hefty.
  - RDBMS were built when storage was expensive (around 70's), and optimized use of storage was one of the use cases of RDBMS. Thus, RDBMS posses **normalization**.
  - But, reducing storage cost in turn, increased CPU cost. Because applications relying on the RDBMS databases need the aggregated information which is obtained by performing complex joins and querying.
  - Thus, RDBMS scales **vertically**, you may add more CPUs to a machine and increase query throughput. RDBMS is good for the use cases where OLAP transactions are the priority.
- NoSQL, on the contrary, is built for OLTP transactions at scale. NoSQL decreases the CPU cost, as it does not require complex joins, but one has to trade storage in turn.
- Alongside, NoSQL scales horizontally and thus motivates to build scale-out storage systems.
- As an e-commerce application, for some of the services which do not require OLAP transactions at all, do not need complex querying, and need scaling at the same time with maximum throughput, without burning CPUs, NoSQL wins it all. :)
- Thus, Dynamo has a simple key-value interface, is highly scalable, efficient in its resource usage, and has a simple scale-out scheme to address growth in request rates.

## Design Principles

- **Incremental Scalability**: Dynamo should scale horizontally, with one node at a time, with minimal impact on the system.
- **Symmetry**: Every node in the environment shares the same set of responsibilities. No nodes with specialized roles lead to the simplification of provisioning and maintenance.
- **Decentralization**: The design should possess decentralized peer-to-peer techniques over centralized control.
- **Heterogeneity**: The system should exploit heterogeneity in the infrastructure, which means, the workload distribution should be done in consideration of the capabilities of participating commodity servers.

The architecture that needs to be operated in a production environment is complex. In addition, the system needs to have scalable and robust solutions for partitioning, replication, versioning, membership, failure handling and scaling.

## Partitioning

One of the key design requirements of Dynamo is that it should scale incrementally. Dynamo's partitioning relies on the consistent hashing to distribute the load across multiple storage hosts.

In Consistent hashing, a ring of hash space is formed. For example, let **H(K)** be any ideal hash function which outputs a value in the range **A₁, A₂, …, Aₙ**. This range is mapped onto a circular ring. The nodes in the system are randomly placed on the formed ring. Every node in the ring is responsible to store the data with the key range between the current node and the previous node (clockwise). Whenever data with key **K** is written, **H(K)** is calculated which is a hash in the possible hash range. The data is stored in the node which is responsible for the particular key range.

Well, there are some challenges with basic consistent hashing. The first one is, random node assignment in the keyspace (ring) leads to non-uniform load distribution (which is quite obvious). And the basic algorithm is oblivious to the heterogeneity in the compute power of nodes. To address these issues, Dynamo uses a variant of consistent hashing.

Instead of mapping node at a single point in the hash keyspace, each node gets assigned to multiple points in the hash ring. These are known as "Virtual Nodes". A virtual node looks like a single node in the system, but each node can be responsible for more than one virtual node.

### Advantages of using virtual nodes:

- If a node becomes unavailable, the load handled by this node is evenly distributed across the remaining available nodes.
- When a node becomes available again, or a new node is added to the system, the new node accepts a roughly equivalent amount of load from each of the other.
- The number of virtual nodes per system is based upon the capacity of the commodity hardware, accounting for heterogeneity in the physical infrastructure.

A bit of the same thing is done in Riak key-value store.

## Replication

Replication is necessary when it comes to high availability and durability. To achieve this, Dynamo replicates the data on multiple hosts. Each data is replicated across **N** nodes in the ring, where N is a configurable parameter. Each data with hash key **H(K)** is assigned to a coordinator node (selected as mentioned earlier). The coordinator node is in charge of the replication of the data items that fall within its range. The coordinator replicates the copies to **N-1** clockwise successor nodes in the ring.

When replication is considered, the cluster might be strongly consistent or eventually consistent. In a Strongly consistent environment, a write is successful only when it is written on all the nodes where it should be replicated. In an eventually consistent environment, a write is successful even when it is written to at least one of the nodes. And the data is eventually replicated.

The famous **CAP** theorem says that a distributed system can have at most two of the following properties:

- Consistency
- Availability
- Partition Tolerance

Partition tolerance is mandatory in distributed systems, as the system should not be prone to failures caused by network partitions. Thus, in most cases, consistency and availability are traded against each other. As Dynamo's objective is to be always available, Dynamo trades availability for consistency. Thus, Dynamo is eventually consistent.

```
A - B - C
\      /
 E - D
```

In the above diagram, the hash key space is divided across all the nodes. The hash key of the data that falls in the range between nodes **E** and **A**, node **A** serves as a coordinator node for that keyspace. For **N=3**, coordinator node **A** will replicate data to the successive **2** (**N-1**) nodes i.e. nodes **B** and **C**. The list of nodes accountable for storing a particular key is called the **preference list**. For this data, the preference list contains nodes **A, B,** and **C**.

Now, what if node **A** was not reachable due to a certain network or hardware failure? Well, there are cases:

- **Case 1**: Node A is not reachable due to network partition or hardware failure.
- **Case 2**: When the systems A, B, and C are handling a large number of concurrent writes/reads to a single data item and multiple nodes end up coordinating the updates concurrently.

In Case 1, as Node A is not reachable, the replicas node A is supposed to store might not get updated and still old version of replicas might persist on that node.

In Case 2, Node A, B, and C are handling concurrent writes/reads, due to eventual consistency, if a write involving a new version of data is made on Node A, and before this data gets replicated on B and C, some client might read the data from node C, but now there exist two different versions of same data on nodes A, B, C. This results in data conflicts.

Well, in Amazon, there are certain features which are tolerant to different data versions. For example, "Add to cart" and "Delete from cart" functions. Both of these are put operations, which changes the state of the cart. Now, if a delete from cart operation is done on Node A, and then add to cart is done on node C, different versions of the cart are being updated. To resolve conflicts, in this case, it's better to merge an old and new version of the cart, rather than overwriting a new version over old.

Dynamo treats every write as an addition of new immutable data. It allows different versions to exist on the system. Most of the time old versions are replaced by newer versions. In this complex infrastructure, it's very trivial to have introduced more than two versions of the same data. And once again, it's only because we trade consistency for availability.

## Data Versioning: Vector Clock

Until this point, we understand that Dynamo might have conflicts for the same data on different nodes. As a whole system, it has got to do two things in order: **conflict detection** and **conflict resolution**. Dynamo, as per its use case, does conflict detection and delegates conflict resolution to the application layer.

Dynamo implements conflict detection using **Vector Clock** (which needs a separate blog for explanation). The vector clock detects the causality between the events and helps in determining if two events were causally related. In an abstract way, the vector clock is the list of **<node, counter>**, associated with all the versions of objects. The conflict detection algorithm uses vector clocks to determine if two events are causally related or not. If two events are not causally related, then they are parallel events and have a conflict between them.

Dynamo, for non-causally related events, keeps both versions of data. When an application tries to read the data, all the versions of objects are presented to the application to determine the correct version. And, during this process, unwanted older versions of objects are garbage collected from time to time.

## GET/PUT Operations & Versioning

A node handling read/write is known as a coordinator node. This is the first among top N nodes in the preference list. If the requests received via a load balancer, requests to read the data might get routed to any random node. If the node that has received a request does not belong to the top N nodes in the preference list, then it will reroute the request to the first amongst top N nodes.

N nodes in preference list are the healthy nodes excluding the nodes that are not reachable, faulted or inaccessible. Accessibility of a node as per requests is determined based upon the health of the node and hence the rankings of nodes in the preference list.

To maintain consistency among its replicas, Dynamo uses a consistency protocol, where it has two key configurable values: **R** and **W**. **R** is the minimum number of nodes that must participate in successful read. And **W** is the minimum number of nodes that must participate in successful operation. The variables are configured based upon the latency received from **R/W** nodes.

On **PUT** operation, the coordinator node generates the vector clock for the new version and writes the new version locally. The coordinator then sends the new version along with its vector clock to the top N nodes in the preference list. Only if it received a successful response from at least **W - 1** nodes, the write is considered as successful.

On **GET** operation, the coordinator node requests all existing versions of data for that key from top N nodes in the preference list for that key and then waits for **R** successful responses before returning the result to the client. If the coordinator node ends up gathering multiple versions of the data, it returns all the versions of data that are causally unrelated. The reconciled version by the application layer is afterward written back.

## Fault Tolerance & Handling Failures

Dynamo uses sloppy quorum, i.e. all read/write operations are performed on the first N nodes in the preference list, which may not always be the first N nodes encountered while walking the consistent hashing ring.

**Case 1** mentioned above, where if node A fails, then the keys which are needed to be stored at A will be stored at D (**replica + 1** node), with a hint in its metadata mentioning that the key actually belongs to node A. Nodes with such hinted replicas will keep them in a separate local database. Upon detecting that A has recovered, D will attempt to deliver the replica to A. Once the transfer succeeds D may delete the object from its local store without decreasing the total number of replicas in the system.

This is known as **Hinted Handoff**. This enabled Dynamo to ensure that the read and write operations are not failed due to the temporary failure of a node. Dynamo also sustains the failures of data centers. In essence, Dynamo can keep replicas across data centers. The preference list in such cases might have nodes distributed across data centers.

Hinted handoff works best when node failures are sparsely distributed across time and the failures are impermanent. What if a node handling hinted replicas goes down too? To handle these cases and other failure scenarios Dynamo has anti-entropy protocol implemented to keep replicas synchronized.

## Anti-Entropy

Synchronizing the replicas is a two-step process. First, detect the inconsistencies and then fix them. Well, to detect the inconsistencies faster and to minimize the transfer of data amongst the nodes, Dynamo uses **Merkle trees**. A Merkle tree stores the hashes, in particular, the parent nodes store the hashes of the children nodes. The root of Merkle tree stores the hash of all the leaf nodes combined.

Merkle tree reduces the data that needs to be transferred across the nodes to detect the inconsistency. If the roots of two Merkle trees are the same then all leaves of the trees are the same. If not, the nodes with different hashes are checked and shared, then the leaves - the data which are "out of sync" - are searched & corrected.

In Dynamo, each node has a separate Merkle tree for each key range, i.e. the range of keys it hosts (virtual nodes). This enables different nodes to compare whether the keys within a key range are up to date. Two nodes exchange the root of the Merkle tree corresponding to the key ranges they have in common. And using tree traversal, the out of sync data can be found and corrected. The disadvantage of this mechanism is there is a lot of addition/deletion of nodes in the consistent hashing ring.

## Failure Detection

Dynamo has a gossip protocol, that exchanges the membership changes and also detects if the node is alive or not. Each node contacts a random peer every second and exchanges the membership changes and reconciles them. A node is considered as failed if that node does not respond to messages. Then, the requests are transferred to the node that maps to the failed node partitions (hinted handoff). But, periodically, the failed node is checked for the recovery. This is the decentralized gossip protocol.

## Implementation

Every node in the system has three major components:

1. Request coordination
2. Membership and failure detection
3. Local persistence engine

---

Dynamo has got all the things that it needs. Well, certainly, databases are always specific to the use case being solved. Some application requires the database to manage conflict resolution on its own, some application might want read-oriented storage and some might want write-oriented storage. It all depends on the use case. Dynamo looks like one of the best implementations of NoSQL databases. I loved reading the paper and the new cool stuff! :)
