# Deploying with Pulumi

## Prerequisites

To deploy this application and its associated infrastructure with Pulumi, you should:

* have the Pulumi CLI installed; 
* have NodeJS installed;
* have the `kubectl` CLI tool installed; and
* have the AWS CLI installed and configured for your AWS account.

## Dependencies

This project is dependent on two other Pulumi projects/stacks:

1. The Kubernetes cluster(s) managed by the Pulumi code in [the `zephyr-k8s` repository](https://github.com/pulumi/zephyr-k8s).
2. The Aurora database cluster(s) managed by the Pulumi code in [the `zephyr-data` repository](https://github.com/pulumi/zephyr-data).

You will need to first create a stack and successfully run `pulumi up` in each of these two projects before starting here.

You will also need to know the organization name(s), project name(s), and stack name(s) for the `zephyr-k8s` and `zephyr-data` stacks; these are used to construct stack references to retrieve data from the other stacks. This information can be retrieved by running `pulumi stack ls` in the directories where these projects reside.

## Instructions

Once you have ensured your system meets the prerequisites and you have satisfied the dependencies, follow these steps:

1. Clone this repository to your local system (if you haven't already).
2. Switch into the `infra` directory.
3. Run `npm install` to install all necessary dependencies.
4. Run `pulumi stack init <name>` to create a new stack. For the smoothest experience, use the same stack name as used in `zephyr-k8s` and `zephyr-data`.
5. Set your desired AWS region with `pulumi config set aws:region <region-name>`.
6. (Optional) Use `pulumi config set` to set values for `platformOrgName` (defaults to your current organization), `platformProjName` (defaults to "zephyr-k8s"), and `platformStackName` (defaults to your current stack name). Unless you know you need specific values here, the default values are typically sufficient.
9. Run `pulumi up`.

**NOTE:** You'll see `Pulumi.test.yaml` and `Pulumi.prod.yaml` stack files in this repository. These are here for illustrative purposes (to tie back to the Pulumi blog series) and will not impact your ability to use the steps above _unless_ you use a stack name of "test" or "prod" for your stack.

After the stack is finished deploying, use `pulumi stack output` to retrieve the Kubeconfig for the Kubernetes cluster (this is also available as a stack output on the Kubernetes stack):

```shell
pulumi stack output kubeconfig > kubeconfig
```

You can then use this Kubeconfig with `kubectl` to interact with the EKS cluster in order to view nodes, Pods, Services, Deployments, ConfigMaps, etc.

As an example, here is how to get the DNS name of the load balancer for the UI service:

```shell
KUBECONFIG=kubeconfig kubectl -n ui get svc ui-lb
```

Use the DNS name displayed in the `EXTERNAL-IP` column in your browser to access the application. Be sure to specify `http://` in order to connect; there is no SSL/TLS support currently.
