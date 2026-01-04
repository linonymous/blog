---
title: "Goroutines & Green Threads: Behind the Multiplexing"
date: 2020-05-10
description: "Understanding how user-level threads are multiplexed over kernel threads to get the best of both worlds"
tags: ["golang", "concurrency", "threads", "runtime"]
slug: "goroutines-green-threads"
draft: false
---

One of Go's most powerful features is goroutines — lightweight threads managed by the Go runtime. But how do they actually work under the hood? Let's dive into the multiplexing of user threads over kernel threads.

## User-Level vs Kernel-Level Threads

Threads are broken down into two categories:

- **Kernel Level Threads**: Managed and scheduled by the operating system
- **User Level Threads**: Managed by the application layer (runtime)

The magic happens when we multiplex user-level threads over kernel-level threads — leveraging the speed of user-level threads and the scheduling capability of kernel-level threads. This gives us the best of both worlds.

## Why Goroutines Are Efficient

Goroutines have several advantages over traditional OS threads:

### 1. Low Memory Footprint

Goroutines start with just a few kilobytes of stack space (around 2KB), compared to the typical 1-2MB for OS threads. This means on 8GB RAM, you can have around a **million goroutines** running!

### 2. Cheap Context Switching

Context switch cost is minimal because:
- Scheduling is **cooperative** and **non-preemptive**
- Goroutines yield control periodically when they are idle or logically blocked
- The switch between goroutines happens only at well-defined points when an explicit call is made to the Go Runtime Scheduler

### 3. M:N Scheduling

Go uses an M:N scheduler where:
- **M** threads (OS threads) run on **P** processors
- **G** goroutines are multiplexed over the M threads

In Golang, the `GOMAXPROCS` environment variable defines the number of processors that will contribute to execution.

## The Go Scheduler Architecture

### Local Run Queue (LRQ)

Every processor has a Local Run Queue. Goroutines in the LRQ are picked up one by one by the scheduler to be scheduled on the owner processor.

### How It Works

1. When you create a goroutine with `go func()`, it's placed in a run queue
2. The scheduler picks goroutines from the queue and assigns them to available OS threads
3. When a goroutine blocks (I/O, channel operation, etc.), the scheduler moves it aside and picks another goroutine
4. This happens transparently, without OS kernel intervention

## Practical Implications

Understanding this model helps you:

- Write more efficient concurrent code
- Avoid common pitfalls like spawning too many goroutines that actually block
- Tune `GOMAXPROCS` for your specific workload
- Debug concurrency issues more effectively

## Conclusion

Goroutines demonstrate elegant engineering — they provide the simplicity of lightweight threads with the power of kernel-level scheduling. This is why Go excels at building concurrent systems.

---

*When in doubt, spawn a goroutine. Just kidding — think about it first.*
