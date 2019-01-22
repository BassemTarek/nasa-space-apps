# Code It Proposal

This is the source code for a dummy code prototype attempting to implement a
tool that visualizes the closest highest distributed concentrated water body
relative to the user of the tool.

The tool's aim is to aid the user in locating underground bodies of water of potential
concern to the user taking into account their inputted position (via search form,
or the GPS function) while also providing various aggregate technical details of
interest, including **Water Depth**, **Water Storage**, and
**Water Productivity**. The system is designed for easy extension (modular and _unassuming/unbiased_ in nature) so extending the tool with more
datasets besides those provided currently (Africa's underground water
distribution and details) is a very simple task of simply adding a few more
lines of code, e.g.
```js
var storage = cruncher("app-data/storage.txt", {
  L: 0,
  LM: 1000,
  M: 10000,
  H: 25000,
  VH: 50000
});

// ... in the ExpressJS router
switch (params[1]) {
  // ...
  case "water_storage":
    map = mapper(storage, lat, long);
    break;
  // ...
}
```
with similar procedures for the client-side code.

We believe this project can assist concerned individuals (.e.g farmers, land owners, land managers, etc) more easily and
painlessly discover various points of interest in regards to the information
provided by this tool, while also assisting them in their various endeavors to
more efficiently utilize the resources at their disposal.
