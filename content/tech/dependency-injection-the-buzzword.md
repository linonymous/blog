---
title: "DI: The Buzzword"
date: 2019-05-15
description: "Demystifying Dependency Injection - a 25-dollar term for a 5-cent concept that makes your code more modular and testable"
tags: ["design-patterns", "software-architecture", "clean-code"]
---

On the last Monday morning, when I was reading a blog about building microservices with Python, I came across this term 'injector' for enough time to give it a thought and dig into it. And that's how I got started with it.

## DI: stands for Dependency Injection
*(ugh! what a fancy and confusing name!)*

It is a very famous code pattern to make the codebase more cohesive and loosely coupled. Often, while coding, we write some classes which internally initialize the objects of other classes. And thus the earlier class becomes dependent on the object creation of the later class. But, thoughtfully speaking, a class should be cohesive and should do nothing more than its purpose.

For example, we have a class **Employee** and a class **Address**. Where an object of class Address is aggregated inside Employee class. Thus, Employee class, while providing a blueprint of an Employee object, now manages the creation of Address object too. This adds up the dependency and makes the class less cohesive.

**What if**, we provide the initialized object of **Address** class to **Employee** class's constructor while object initialization, provided that **Employee** class has provision to accept an **Address** object as an argument? Well, that's what **dependency injection** is!

> **Dependency Injection** is a **25-dollar** term for a **5-cent** concept
>
> -- A Reddit User

In the above example (before the quote :P), when we say **Employee** class provides a way to accept an **Address** object in the constructor means **Employee** class has a way to inject an **Address** class. This is the entire idea of dependency injection. But there are many ways a class can provide a way to inject the object of other classes. For this purpose, some brilliant minds have come up with advanced frameworks too.

## Advantages of Dependency Injection

- **High Cohesion** - Code becomes modular, less complex, more reusable, and of course easy to debug
- **Flexibility** - As the object attributes are configured outside, there is nice flexibility in providing various definitions of the same component.
- **Easy Testing** - Mocking objects and providing them to the class becomes easy.

## Disadvantages

- If overused, it can lead to management issues and other problems.
- Many compile-time errors are pushed to run-time. As for IDE sometimes finding references becomes complex.

## IoC (Inversion of Control)

Often while discussing DI, another popular term that is used is IoC i.e. Inversion of Control.

Inversion of control is an Architectural Pattern where the flow control of a system is provided by a generic library that calls into custom business logic. The inversion is the delegation of the control flow. Whereas in comparison, Dependency Injection is a code pattern that severs the creation of stateful dependencies from the use of those dependencies.

Thus, the Dependency Injection frameworks are the ones on whom the code is dependent for object creation. Thus, DI is achieved through IoC, or DI is a form of IoC - the later sounds better.
