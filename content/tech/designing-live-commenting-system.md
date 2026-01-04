---
title: "System Design: Designing Live Commenting"
date: 2021-08-10
description: "Building a scalable live commenting system - from database design to real-time data sync across continents"
tags: ["system-design", "distributed-systems", "real-time", "architecture"]
---

All of us surely have come across bunch of systems that support live commenting. For example, Facebook live commenting, Twitch/YouTube live stream commenting, Reddit live stream commenting etc. Let's deep dive into the system that supports the live commenting feature.

## Requirements

- User should be able to see active real-time comments on the post/video/stream across the globe.
- System should be highly available, fault tolerant.
- Due to CAP theorem, we will need to trade the consistency. Consider our system to be eventually consistent. If the comment is made, it's okay for us if it takes few seconds to appear everywhere else.

## Goal

- To build a system to sync live comments across the demographies & data centers
- To build a system that supports the real-time pushing of comments to the web/mobile clients.

## Estimation

- Consider 100M Daily Active Users (DAU), 400M daily posts/videos/streams on the system and daily 10B comments being made on different streams/videos/posts.
- To support such high scale we need a robust & scalable system.

## Database

As we are only concerned about comments, our database will look something similar as follows:

```
Comment(id(PK), user_id(FK), post_id(FK), text, timestamp, metadata)
```

**PK:** Primary Key, **FK:** Foreign Key

Consider that we only allow the text as a comment and no media can be added to the comment.

## APIs in the Context

Let's write some APIs that support the live commenting feature:

### POST /comment?post_id=<post_id>

This API adds up the comment to the given post. It also handles the authorization with API key, particularly a JWT token that is refreshed after a while.

### GET /comments?post_id=<post_id>&page_size=<size>&page_number=<page_no>

This API requests the comments to the server for given post_id starting from page_number and returns the list of comments of size max(page_size, size of comments array)

These APIs are enough to support our listed requirements.

## Components

To query the latest comments we can use the following query:

```sql
SELECT * FROM comments
WHERE post_id=<post_id>
ORDER BY timestamp DESC
LIMIT <page_size> OFFSET 1
```

But this is going to be very expensive given the scale we are targeting for.

Apart from that, a media can be viewed from different parts of the world, so syncing the live comments globally is the next challenge.

## Read Locally, Write Globally

Generally data sync across the continents is performed eventually, meaning, if a user posts a photo in India, & his Facebook friend who is accessing a feed from USA, will not be able to see the post immediately. The data will be replicated in some moment, to the nearest servers & then the post will be added to the feed.

This method is known as **Read Locally, Write Globally**. i.e. The data is queried from local servers, & updates are eventually asynchronously written globally across different servers. What if we try to use the same approach for Live Commenting feature?

- Number of comments being made globally on popular media videos would be significant in numbers.
- If we depend upon the eventual sync across servers globally, then there might be delay of few minutes & this counters the idea of live commenting. Moreover, the people from same region would be able to see each others comments on live whereas people across regions would not be able to see each others comments till the next sync happens.
- This approach is perhaps better when the system is read heavy. But in the case of live commenting, there are going to be lots of writes & for every single write, there is going to be a read performed. So, we need to look out for an approach that suits the scale of write operations.

## Write Locally, Read Globally

This is the exact opposite of the approach that we just discussed in the last paragraph. In this approach, we would write the comments locally, but while querying the comments for a media, the server would ask the fellow servers globally in different continents if they have new comments on the media (which can be done with lastTimestamp approach), and then the local server would aggregate all the comments & return back the responses to the client.

As compared to previous approach, sync latency of the comments across regions is reduced. As writes are done locally & not replicated across, the system does not get loaded up with the jobs syncing the huge number of writes. This approach suits well for the purpose.

Next task to think about is how to send these new comments to the users who are currently scrolling through their feed.

There are two ways to deal with this problem:

## 1) Pull (Fan Out on Load)

- Client has to request data to servers recurrently. Most of the times, responses to these requests are going to be empty, and will consume lot of unnecessary resources.
- Data might become stale unless a client requests for information.
- To make the live commenting feature appealing to users, minimum latency of 50ms is necessary to make it feel realtime, with this latency it might cause lot of load onto the servers.

## 2) Push (Fan Out on Write)

- Clients have to maintain long poll request with the server. This can also be achieved with websockets.
- Server pushes the information to all persistent connections.
- Disadvantage is, if there are millions of clients awaiting for same piece of information, it might overwhelm the server. This problem can be solved with more servers & consistent hashing with custom keys.

Given the use case, the comments should load real time, thus **Push method with persistent connection/long poll** suit our needs.

## Example Architecture

![Live Commenting Architecture](/images/posts/live-commenting-architecture.png)
