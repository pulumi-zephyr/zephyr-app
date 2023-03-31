# Using Pulumi for Local Testing

This directory contains a Pulumi program for local testing (i.e., to build container images from source and deploy them to a local Docker daemon).

Before you can use this Pulumi program, you will need:

1. The `pulumi` CLI installed
2. A local Docker daemon running (using Docker Desktop for Windows/Mac is fine)
3. NodeJS installed (this was tested with Node 18)
4. Version 4.1 or greater of the Pulumi Docker provider (should be installed automatically when you run `pulumi up`)

Once the prerequisites are met, then set configuration values (see the section titled "Configuration Values") and run `pulumi up`. Within a few minutes, all the containers will be deployed locally. You can access the Zephyr online store by navigating to `http://localhost:8888`.

Run `pulumi destroy` to delete the containers. Note that `pulumi destroy` does not delete container images; this is done to help speed up consecutive deployments of the application.

## Configuration Values

There is one required configuration value and six optional configuration values.

The required configuration value is `mySqlPassword`. Use `pulumi config set mySqlPassword <desired-password>` to set a MySQL password that will be used for the MySQL instances and related services. **You must set this value before you can successfully run `pulumi up`.**

The first optional configuration value is `srcRepoPath`. If omitted, this defaults to `../..`, which is the correct value if you are running this Pulumi program from the `develop/pulumi` folder of the repository. If you need to change this value, use `pulumi config set srcRepoPath <new-path-to-source-files>`.

The remaining five optional configuration values control whether the Pulumi program will build container images from source or use a released container image. The default is to build images from source; if these values are omitted, then that is the action the program will take.

To use a released container image instead, set one or more of the following flags using `pulumi config set`. Set the value to something _other_ than "build":

* For the assets service, set `assetsFlag`
* For the carts service, set `cartsFlag`
* For the catalog service, set `catalogFlag`
* For the checkout service, set `checkoutFlag`
* For the orders service, set `ordersFlag`

For example, if you wanted to build _only_ the assets service and use released versions of all other services (perhaps to isolate changes to the assets service for testing), you would use `pulumi config set` to set all the above values **except** `assetsFlag` to something _other_ than "build", like this:

```shell
pulumi config set cartsFlag release
pulumi config set catalogFlag release
pulumi config set checkoutFlag release
pulumi config set ordersFlag release
pulumi up
```

This would cause the Pulumi program to build the UI and assets services (UI is always built from source) and use released container images for all other containers.
