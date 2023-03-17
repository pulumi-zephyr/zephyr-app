# Deploying with Pulumi

This project has a dependency on the Kubernetes cluster(s) managed by the Pulumi code in [the `zephyr-k8s` repository](https://github.com/pulumi/zephyr-k8s). You will need to have created a stack from that project and run a successful `pulumi up` before starting here. You will also need to know the organization name, project name, and stack name for the stack that manages the Kubernetes cluster(s). All of this information can be obtained by running `pulumi stack ls` in the directory where the `zephyr-k8s` project resides.

To deploy this application and its associated infrastructure with Pulumi, you should:

* have the Pulumi CLI installed; 
* have NodeJS installed;
* have the `kubectl` CLI tool installed; and
* have the AWS CLI installed and configured for your AWS account.

Then follow these steps:

1. Clone this repository to your local system (if you haven't already).
2. Switch into the `infra` directory.
3. Run `npm install` to install all necessary dependencies.
4. Run `pulumi stack init <name>` to create a new stack.
5. Set your desired AWS region with `pulumi config set aws:region <region-name>`.
6. Run `pulumi config set eksOrgName <org-name>` to supply the name of the Pulumi Service organization where the Kubernetes cluster stack was created.
7. Run `pulumi config set eksProjName <project-name>` to supply the name of the Pulumi Service project where the Kubernetes cluster stack was created.
8. Run `pulumi config set eksStackName <stack-name>` to supply the name of the Kubernetes cluster stack.
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
