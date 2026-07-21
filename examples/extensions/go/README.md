# Go extension example

Install dependencies, build, then make the package resolvable by the Vedh CLI.
Register it in a project with:

```sh
vedh extensions add @example/vedh-extension-go
```

The extension contributes Go grammar support for `.go` files, function/type
declarations, function calls, and imports. Publish the package under your own
scope before using it outside this repository.
