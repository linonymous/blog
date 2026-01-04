---
title: "Configuring Systems in Multiple VLANs"
date: 2019-04-10
description: "A practical guide to networking concepts, VLANs, subnetting, and routing with a real-world use case"
tags: ["networking", "vlans", "linux", "infrastructure"]
---

## Preface

When it comes to Networking, I always thought it's so boring and never ever gave a thought about how cool it can be! Well, as a human, psychologically, we all tend to have some biases, towards clothes, brands, things, opinions, judgments, emotions, the language to code in :P, etc which all contribute to some stubborn prejudices in our mind and which in turn creates conjectures. Well, in my opinion, conjectures aren't healthy (subjective), as you tend to live in your hypothetical world without giving damn about facts and proofs. And the only way out is to cross-examine every decision, opinion, and judgment you make. Well, it's not a psychology blog, let's just leave it here. :) This is my experience of getting out of my prejudice with networking.

While working for a network feature, I came across this amazing use case. Thought of writing it down after I get done with it. Now I think it's the time. Grab your chair and popcorn, here it goes!

## Concepts

- **VLANs**: A group of devices across one or more LANs, that are configured to communicate as if they are in the same network, or connected to the same wire. Machines in the same VLAN share the same broadcast domain, i.e. they share the same subnet.

- **Multi-VLANs**: Multiple VLANs, i.e different subnets.

- **Main Route Table**: In Linux networking, the main routing table can be seen with `ip route show` command.

- **Policy Route Table**: Other than main routing table, in Linux networking we can create policy routing tables/local routing tables.

## Basics

- Routing is like signboards on streets, leading you to your destinations. (Only if you know where you are heading to. :P)

- Keeping it abstract, we already know, when we access something on the internet, the request is bundled into a packet or packets. These packets along with the request, travels through the network (internet), towards the server which is able to serve that request. Server unpacks the packet, reads the information, authorizes it, performs operations if needed and responds back with the requested data.

- In the midst of request and response, the source machine and destination machines are interchanged. Ex. For a request, system A is a source and system B is a destination. Whereas, for a response, system B is a source and system A is a destination.

- When the packet travels, it is passed onto different machines, which are believed to know the address of the destination machine. These machines are generally referred to as gateways and routers. These machines are supposed to be traffic handlers, the signboards, so as to lead the packets to their destinations.

- Now, I assume you understand routing well. Let's see what is a switch and what it does.

> A network switch is a multiport network bridge that uses hardware addresses to process and forward data at the data link layer (layer 2) of the OSI model.

Let's dissect it to digest it:

- A network bridge connects two separate networks as if they were a single network.
- The hardware address is a MAC address, a unique identifier for NIC cards.
- The data link layer is the second layer in the OSI model, which is concerned with the communication of "frames" in between nodes at the same network level i.e in same network subnet.

### Understanding Subnetting

- IPv4 addresses is a 32-bit address with four 8 bit segments. And with 8 bits you can only represent numbers between 0-255. With these constraints, you may have **4,294,967,296 (2³²)** unique IPv4 addresses which are **2¹²⁸** in IPv6 addressing.

- During the early stages of the internet, organizations used IP addresses extensively and started running out of it. Then the creators came up with the approach of subnetting.

- The process of taking an extensive network and splitting into smaller networks is known as subnetting.

- An IP address can be broken down into two parts, a network part, and a host part. A network address defines the network with multiple hosts. And host address signifies the host address in the specified network.

- For example, 192.168.50.0/24 is a network address. Which means, 24 bits out of total 32 bits represent the network address, that signifies, there can be **2²⁴** different networks and 192.168.50.0 is one of the network in them. Whereas, remaining 8 bits represents **2⁸** i.e **255** unique hosts per network.

- If you are owning an org then segregation of networks with respect to the environments becomes necessary. With subnetting, you may have a different subnet for the production environment, different for CICD environment, so and so forth.

- Well, now, network switch, as it works in the data link layer, is concerned with communication between hosts in the same network. Which means, hosts in the same network connected to a switch can talk directly, whereas two hosts in different subnets can not talk directly.

- We can call a subnet as a broadcast domain, which means, if a packet is broadcasted in a subnet, it would reach all the hosts in the subnet.

- Two broadcast domains (subnets) connected to the same switch can not talk directly unless guided by a gateway or a router. Which means gateways/routers are needed only when you have to reach out to the machine outside of your subnet.

- According to that, if Google's server would be in your subnet, you would no longer need to reach the gateway and ISP to get responses for requests. :)

## Use-Case

![VLAN Diagram 1](/images/posts/vlan-diagram-1.jpg)

Alice, Bob, Charlie, and Dev are connected to the same switch. Apparently, all do not belong to the same subnet. Bob and Charlie are in the same subnet i.e. 192.168.10.0/24 whereas Alice and Dev are in the same subnet i.e. 192.168.20.0/24.

### Situation #1: No gateways exist

- Alice can talk to herself and Dev (by talking I mean reach out to others through a network).
- Alice cannot talk to Bob and Charlie as the switch does not serve communication across subnets as it is a layer 2 switch. :)
- Bob can talk to himself and Charlie.
- Bob cannot talk to Alice and Dev.

### Situation #2: Charlie and Dev become gateways

Charlie becomes a gateway for 192.168.10.0/24 network and Dev becomes a gateway for 192.168.20.0/24 network. Both Charlie and Dev are configured with either static routes or some dynamic routing protocol. In fact, Charlie and Dev know about each other's subnet and can talk across.

- Alice can talk to Dev directly.
- Now Alice wants to talk to Charlie, Alice sends a message to Dev (as Dev is default gateway) and asks him to deliver the message to Charlie if he knows where it stays. Charlie, in fact, knows the address and delivers the message.
- Now Alice wants to talk to Bob. Alice sends a message to Dev and asks him to deliver the message to Bob if he knows where he stays. Dev searches on its list and he finds out Charlie (as it is a gateway) might know about Bob as both are in the same subnet. Dev sends the message to Charlie and tells him to deliver it to Bob if he knows him. Charlie knows Bob very well as they stay together in the same subnet, and hence Charlie delivers the message.

**Key takeaway: If a host wants to send a message to any host outside the network/subnet/broadcast domain, it has to go via the gateway of that network.**

## Building Up the Use Case

Referring above diagram, let's say, Bob serves as a Kafka server. Whereas Alice, Charlie, and Dev are Kafka clients. And to bring it closer to reality, let's consider, Alice, Bob and Dev receive tweets tweeted by different users and they publish these tweets to Kafka server. Which are in turn fetched by subscribers who are subscribed for the tweets from the people who tweeted it. And now consider, millions of users tweeting every second. There are millions of tweets received by Alice, Dev, and Charlie per second. They publish these tweets to Kafka server i.e. Bob.

What happens next?

In seasons, such as New year, Diwali or Loksabha elections, number of tweets tweeted per seconds might get increased. Perhaps, during elections, BJP and Congress PR teams work hard and post many tweets so as to trend targeted hashtags.

Now, Alice, Dev, and Charlie are dumping the data to Bob in a huge mass:

- Alice gives data to Dev via the switch, Dev gives data to Charlie via the same switch and Charlie gives it to Bob via the same switch.
- Dev gives data to Charlie via the same switch, and Charlie gives data to Bob via the same switch.
- Charlie gives data directly to Bob via the switch.

We are only talking about three clients, what if there are many clients in different subnets. All of these happening at a time might overload the switch, which in turn might cause packet loss. It might cause switch failure, which is hard to debug at production time. In this case, some tweets might not be published to the kafka server. It is a trivial problem.

### What Could Be the Solution?

One possible solution is to move all the clients in the same subnet as that of Kafka server. But, this solution is not scalable, we might not go beyond a certain number of hosts in the subnet depending upon the subnet mask. And at the scale of Twitter, this is obviously not so good solution. What else can we do?

We all know there is an ethernet card on a machine. Each Ethernet card is associated with one permanent MAC address and floating IPv4 or IPv6 address.

What if I add ethernet cards on Bob's machine? Each Ethernet card for a different subnet. Would that work? Let's find out.

![VLAN Diagram 2](/images/posts/vlan-diagram-2.jpg)

### What is Happening Above?

- We added one another Ethernet card on Bob's machine and assigned an IP address of subnet 192.168.20.0/24 which is the same as that of Alice.
- Now, let's get back to our communication ways:
  - If Alice wants to dump tweets to Bob, Alice can do it directly to Bob via NIC2 that Bob has, because Bob's NIC2 is reachable to Alice via layer 2 switch directly and does not need any intervention of a gateway.
  - If Dev wants to dump data, he can do it in the same way as Alice did on NIC2, as Bob's NIC2 and Alice and Dev are in the same subnet. :) which makes them reachable via data link layer.
  - In the case of Charlie, the data will be dumped to Bob but via NIC1 as NIC1 of Bob and Charlie are in the same subnet.

Fair Enough! We are now halfway there. But let's check for correctness.

We talked about request only, what about responses?

One thing to talk about - even if I am unaware of how networking works, I expect that the responses should only be received along the same way as that of requests were made. Sounds convincing, right!

Now, let's see how these responses would come back. One thing to give attention to right now is Dev is still a gateway of Alice and Charlie is still a gateway for Bob.

- Alice request is directly made through NIC2 of Bob's machine. Now, Bob prepares a response with Bob as a source and Alice as a destination. Here's the catch: Bob has two NICs, and two different subnets and Charlie is its default gateway. Bob knows that if he does not know where the destination is (assuming no other static routes other than gateway are configured) then he should send it to Charlie via NIC1. And as Bob is configured with default gateways Charlie via NIC1, it will send the response to Charlie, then Charlie will send the response to Dev and Dev will send the response to Alice back.

This is a major problem - we were about to reduce switch and gateway overhead. But, seems like responses are still going through the default gateway!

### The Solution

But wait! We already know how to configure static routes. What if we manually add a route at Bob's machine so as to route the responses to subnet 192.168.20.0/24 via NIC2:

```bash
ip route add 192.168.20.0/24 dev NIC2
```

This route is now configured at Bob's machine.

As we know, the machine sends any request/response to the gateway only if that machine is not directly reachable to the destination or in our case routes are not configured for a different subnet.

Now, after adding above route, while sending responses to the machines in 192.168.20.0/24 subnet, it would go through configured static routes, where it would find how to route responses for subnet 192.168.20.0/24 at NIC2. And no responses will go through the gateway i.e. Charlie.

Well, now, all requests and responses will go through the switch without Bob negotiating with its gateway, minimizing overhead and minimizing switch/gateway/router failures.

---

Ta-Da! It's done. We solved it. And obviously, Networking is cooler than I said here. We should give things/topics/tech chances to prove its coolness to our brain. If they are really cooler, the time spent learning it would be worthy. :)

*P.S.: The Twitter example discussed above is out of pure imagination. Any resemblance to reality is pure coincidence. :P*
