---
title: "Behind the Multiplexing of User Threads over Kernel Threads: Goroutines & Green Threads"
date: 2020-05-15
description: "Understanding how Go achieves high concurrency by multiplexing lightweight goroutines over kernel threads"
tags: ["golang", "concurrency", "threads", "system-design"]
---

## Introduction

I have been working on Golang for quite a time now. I explored a lot of features. The few that caught up my eye were 'Scalability' & 'Concurrency'. Scalability & Concurrency have been some of the major objectives behind the design of Golang. Let's dive in a bit.

## Threads

A thread is the unit of execution within a process. A process can have anywhere from just one thread to many threads. On a machine, we have multiple processes running and in these processes, we have independent or dependent threads aggregating computations.

Contextually, these threads are further broken down into two types, namely **User-Level Threads** and **Kernel Level Threads**. The basic difference between these threads is that the kernel-level threads are managed, operated, and scheduled by the operating system (kernel), and user-level threads are managed, operated, and scheduled by the application layer.

Just to have more understanding about them, let's list down the advantages and disadvantages!

## Advantages of Kernel Threads

- The kernel knows the whereabouts of kernel threads. Thus, Kernel can schedule these threads optimally, i.e. the scheduler can give priority to a process with a large number of threads over the process with comparatively fewer threads.
- Kernel threads are secure and are managed by native OS.

## Disadvantages of Kernel Threads

- Kernel threads are very inefficient, these threads take a lot of time during a context switch. It involves changing a large set of processor registers that define the current memory map and permissions. It also evicts some or all of the processor cache.
- Kernel threads are very slow. These threads are spawned by the kernel using system calls, which are hefty when it comes to execution speed. Thus, kernel threads are slow to start/stop.

## Advantages of User Threads

- Well, well, first thing first, you can implement your own user threads, even when the native OS does not support any concurrency.
- User threads are comparatively very cheap to spawn and consume less memory than the kernel threads. Creating a new thread, switching between threads & synchronization of these threads are done via procedure calls and have no kernel involvement. Thus, user threads are faster than kernel threads.

## Disadvantages of User Threads

- User-level threads are not optimized for scheduling, the reason being, kernel scheduler is way more optimized than the custom schedulers.

Looking at the pros and cons, what if we leverage the speed of user-level threads and the scheduling capability of kernel-level threads? Thus, to get the best of both worlds, it's better to **multiplex the user-level threads** (lightweight, easy to create, but not known to the kernel so poor scheduling) **over kernel-level threads** (good at concurrency and scheduling, but inefficient for creation, maintenance & context switch).

## Underhood Goroutines Concurrency

- **P**: Number of Processors
- **M**: Number of threads (OS level)
- **G**: Number of Goroutines (user level, green threads)

There are M threads running on P processors and G threads (goroutines) are multiplexed over the M threads (kernel level).

Thus G goroutines need to be scheduled on M OS threads which are internally scheduled over P processors. In Golang, the **GOMAXPROCS** environment variable depicts the number of processors (cores in the system) that will be contributing to the execution of these threads. Note that, **GOMAXPROCS** set to **1** means no parallelism. Given that **P <= GOMAXPROCS**.

Every processor has a **Local Run Queue** i.e. **LRQ**. Goroutines in LRQ are picked up one by one by the scheduler to schedule them on the owner processor of LRQ. Above this, there is a **GLOBAL RUN QUEUE** i.e. **GRQ**. GRQ is shared across all threads. As LRQ is local, the scheduler threads do not need locks over it, i.e. LRQ doesn't need to be synchronized as they are accessed by only one thread. Whereas, GRQ needs locking as this queue of tasks is shared across all the processor threads.

Whenever the scheduler does not find any thread on LRQ, then it performs **thread stealing**, which means it randomly accesses the LRQs of other processors (now LRQ needs locking) and steals half of the workload.

If in case, there are no threads to steal from other LRQs, the scheduler gets the workload from GRQ.

## Advantages of Goroutines

- Less memory consumption (few kilobytes per goroutine)
- Less setup and teardown cost (user-space threads)
- Context switch cost is less as the scheduling is cooperative and non-preemptive. In cooperative scheduling, there is no concept of the scheduler time slice. In such scheduling, Goroutines yield the control periodically when they are idle or logically blocked in order to run multiple goroutines concurrently. The switch between goroutines happens only at well-defined points, when an explicit call is made to the Go Runtime Scheduler. And those points are:
  - Send/Receive calls over the channels, as it involves the blocking calls
  - Go statement, thus it is not guaranteed that the new routine will be scheduled immediately.
  - Blocking syscalls for the file or network operations.
  - After being stopped for a garbage collection cycle.

## Fun Fact

Considering 2KB size of single goroutine and 8GB of RAM, you can run:

- 500 goroutines per 1MB
- 500,000 goroutines per 1GB
- 4,000,000 goroutines per 8GB

Given the calculation, on 8GB RAM, we can have around **a million goroutines** running!
