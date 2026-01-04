---
title: "The Stuff You Should Know About InnoDB - MySQL Storage Engine"
date: 2019-05-10
description: "Deep dive into InnoDB - MySQL's default storage engine, covering B-Trees, clustered indexes, buffer pools, and MVCC"
tags: ["databases", "mysql", "innodb", "storage-engines"]
---

It's been quite a while after the first blog about **Storage Engines**. But after that blog, the thing that hit me was how the databases like the great **MySQL** and the legend **PostgreSQL** works (subjective). While exploring **MySQL** I came across the famous, and default storage engine of **MySQL**, i.e. **InnoDB**.

Whenever you create a table without mentioning **'ENGINE'** attribute in a query, you are telling **MySQL** to go and use **InnoDB** to create the table. Well, there are many amazing/awesome/mind-forking storage engines that can be used instead of **InnoDB**. But, as **InnoDB** is the default, we should not hesitate to explore it.

## What is InnoDB?

**InnoDB** is the general-purpose storage engine that balances high reliability and high performance. Reliability is the fault tolerance quotient of the system. In **MySQL 8.0**, **InnoDB** is the default **MySQL** storage engine, unless you configure it with other storage engines.

## What the Hell InnoDB Has?

### B-Tree indexes
(ugh! We already know that!)

### The backup/point in time recovery

**MySQL Enterprise Backup** product can be used to take backups of entire instances or selected databases, tables, etc. This supports **incremental and compressed** backups. Physical backup helps fast restore than logical backup. With **'mysqldump'**, InnoDB tables can be enabled for an online auto-backup using backup policies. Well, there are many ways and products for backup. The important point is, InnoDB supports that. :)

### Clustered Index

The clustered index defines the order in which data is **physically** stored in a table. Table data can be stored only in one way, thus, there can be **only one** clustered index per table. In SQL server, the primary key of the table automatically creates a clustered index on that particular column.

Having student data in the table, and **'roll_number'** as the primary key, would force the database to create a clustered index based on **'roll_number'** attribute of the table.

Custom clustered indexes can also be created. You can use **'first_name'** and **'last_name'** to create a clustered index. This means, first the data is sorted with **'first_name'**, if **'first_name'** comes out to be the same for two or more rows, those rows are sorted using **'last_name'**. These are also called as **COMPOSITE** indexes.

The non-clustered index doesn't sort the physical data inside the table. Perhaps, it **creates a non-clustered index** and stores it at one place, whereas the real data is stored in another place. This is similar to the Index in the book and the content. The index contains column values on which the index is created and the address of the record that the column belongs to. It's important to note here that, as table contents are stored at another place, they can get stored in some order with respect to the associated clustered index if it exists. Whereas, the non-clustered index is stored in a sorted order of the values the non-clustered attribute has. Generally, clustered indexes are faster than non-clustered indexes since they do not involve extra efforts for lookups.

### Compressed Data
Yes! Com-press it!

### Data Caches

InnoDB has a **buffer pool**, where it keeps all caches to tables and indexes so as to speed up the query processing. On dedicated servers, up to **80% of physical memory** is often assigned to the buffer pool.

The **buffer pool** is divided into pages. The cache management is implemented using a linked list of pages. And the data that is rarely used is aged out of the cache using a variation of **LRU algorithm**. Buffer pool list is divided in **5/8** and **3/8** parts. The 5/8 part is the new sub-list and 3/8 part contains the old pages. When a new page is inserted, it is inserted at the end of the 5/8 part and then moved up/down based upon its access temperature. Whereas, the pages at the end of the pool list are thrown out as they age out.

### Adaptive Hash Index

This is **in-memory hash index**, just like what we have seen in case of SSTables, the in-memory index which contains pointers to the data on the disk. These indexes are fixed in numbers and they are adaptive based upon the frequency of access of the data.

### MVCC (Multi-Version Concurrency Control)

**MVCC** stands for **multi-version concurrency control**. While handling race conditions concurrency control comes in picture. The concurrency control can be done in one of the following ways:

- Avoid the conflicts by employing a pessimistic locking mechanism. (Ex. **Two-Phase locking**)
- OR Allow conflicts to occur, but you need to detect them using an optimistic locking mechanism. (Ex. Logical clock, MVCC)

In the case of **2 Phase Locking** (2PL), every read requires a **shared lock**, while a write operation requires taking an **exclusive lock**. A **shared lock** blocks writes but allows reads. Whereas **exclusive lock** blocks read as well as writes. And due to this locking mechanism, the contention is incurred. What if reads do not block writes and writes do not block reads? Well, **MVCC** does that.

Researchers have come up with this approach, where readers read the data that has been previously committed to the database, not the recent update. For example, the server has a **"cnt"** variable set to **8**. Now, **user A** issues read request and it receives value **8**. While **user B** issues a write request and changes the **cnt** to **10**. Now, **user A** again issues read request, it still gets value as **8**, because **user B** has not committed on the value **10** as of now. Now, **user B** commits the changes. And now **user A**, as well as **user B** issues read requests, both gets the updated value as **10**. As simple as that. :)

---

**Conclusion:** Storage engines of the databases you are using should be learned and understood before using in production. Every storage engine has a purpose. Make sure your product is aligned to the purpose of the storage engine you are using ;)
