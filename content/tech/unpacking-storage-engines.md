---
title: "Unpacking Storage Engines"
date: 2019-02-15
description: "Understanding how databases store and retrieve data under the hood - from hash indexes to log-structured storage engines"
tags: ["databases", "storage-engines", "distributed-systems"]
---

When it comes to storage, the very basic notion that occurs is a Database. A database should store the data when given and read it back when asked. But wait, as a developer...

## Why Should We Care?

We know the databases, SQL and popular NoSQL. And there is a vast number of different databases available out there. Every one of them is optimized for different types of workloads and are based on different storage engines. FYI, a storage engine is a software module that a database management system uses to create, read, update and delete data from a database. In order to tune the storage engines, you have got to understand the type of workload you are going to serve and what storage engine is doing under the hood.

There are different storage engines. For example, Log-structured storage engines, and page-oriented storage engines.

## Stuff to Care for When It Comes to Database

The database often deals with concurrent reads/writes, thus it is ought to have better concurrency control mechanism. Depending on the storage engine underneath, it should perform defragmentation without affecting performance. Moreover, in just a sentence, a DBMS should obey ACID properties.

## Simple Storage Engine

Let's consider a storage engine where for every write, data is appended at the end of the file. Even for modification, the new value is written at the end of the file. These writes are sequential writes and perform better than random writes. For every read, we return the latest occurrence of the data i.e. {key: value}. But how to efficiently find the data on the disk? We need some sort of indexing, which would in turn help in locating the data on the disk.

Index, in general terms, is about keeping some metadata aside, which can be leveraged later for efficient retrieval of the on-disk data. But, this involves maintaining another secondary data other than primary data. It also incurs the overhead of maintaining the secondary data and consistency between them. This is a trade-off in storage systems.

## Indexing: Hash Indexes

Hash indexes store key-value pairs and are generally implemented using a hash map. Let's continue our example - if we are having a storage engine based on append-only (logging) mechanism, we can maintain an in-memory hash map, where we map keys with the file pointer of the value on the disk. Now, whenever a read request comes, we check for its key in the in-memory hash map and perform disk seek in O(1) using the file pointer associated with the key and return the original value. This rapidly improves the read performance, on the cost of maintaining the in-memory hash map for every key in the database. But not a bad approach at all!

For every write, we append the data at the end of the on-disk file and update the file pointer in the in-memory hash map. But wait, what about the disk space?

So, to tackle this we break the on-disk file into segments of a certain size. Every data is appended to the current segment (active segment) and if the size of the active segment reaches a certain threshold, we create another segment which now becomes the active segment and the previous segment is marked as old segment. Old segments are kept immutable.

To solve disk space problem, we run compaction and merge algorithm, where old segments are iterated over and compacted - i.e. the duplicate keys are replaced with the latest occurrence of the key and are merged into the single segment. This is a timely process and runs after a definite amount of time. While serving IOs data is read from the old segments, and when compaction and merge completes, the old segments are deleted and these new segments are added, requiring file pointer update in the in-memory hash map. Appending and merging are sequential write operations which are generally much faster than random writes.

## Riak: Bitcask

Well, this is the exact way in which Bitcask works. Bitcask is a default storage engine used by Riak Key-Value store. It serves well when the workload involves lots of key-value updates. Bitcask provides high performant reads/writes due to, of course, in-memory hash map, which also incurs the overhead of having all the keys in the memory.

## Problems with Bitcask

1. Bitcask requires all keys to be in memory.
2. Range queries are not efficient (keys are not sorted) and take much time.

Bitcask is way cooler and simple. Let's explore more cooler technique, SSTables in the next blog!
