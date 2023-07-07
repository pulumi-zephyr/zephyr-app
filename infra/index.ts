import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import * as awsx from "@pulumi/awsx";

// Get the current organization and stack names
const currentOrgName = pulumi.getOrganization();
const currentStackName = pulumi.getStack();

// Grab some configuration values
const config = new pulumi.Config();
// Use the current organization name if none is specified
const platformOrgName = config.get("platformOrgName") || currentOrgName;
const dataOrgName = config.get("dataOrgName") || currentOrgName;
const platformProjName = config.get("platformProjName")  || "zephyr-k8s";
const dataProjName = config.get("dataProjName") || "zephyr-data";
// Use the current stack name if none is specified
const platformStackName = config.get("platformStackName") || currentStackName;
const dataStackName = config.get("dataStackName") || currentStackName;

// Create StackReferences to get information from other stacks
const kubeSr = new pulumi.StackReference(`${platformOrgName}/${platformProjName}/${platformStackName}`);
const baseKubeconfig = kubeSr.getOutput("kubeconfig");
const dataSr = new pulumi.StackReference(`${dataOrgName}/${dataProjName}/${dataStackName}`);
const catalogDbEndpoint = dataSr.getOutput("catalogDbEndpoint");
const ordersDbEndpoint = dataSr.getOutput("ordersDbEndpoint");

// Build database connection strings for catalog and orders
let catalogConnectionString = catalogDbEndpoint.apply(catalogDbEndpoint => catalogDbEndpoint + ":3306");
let ordersConnectionString = ordersDbEndpoint.apply(ordersDbEndpoint => "jdbc:mariadb://" + ordersDbEndpoint + ":3306/orders");

// Create a new Kubernetes provider for the EKS cluster
const eksProvider = new k8s.Provider("eks-provider", {kubeconfig: baseKubeconfig});

// Define consistent labels for each component
const assetsLabels = {
    "app.kubernetes.io/name": "zephyr-app",
    "app.kubernetes.io/component": "assets",
    "app.kubernetes.io/managed-by": "pulumi"
}

const cartsLabels = {
    "app.kubernetes.io/name": "zephyr-app",
    "app.kubernetes.io/component": "carts",
    "app.kubernetes.io/managed-by": "pulumi"
}

const cartsDbLabels = {
    "app.kubernetes.io/name": "zephyr-app",
    "app.kubernetes.io/component": "carts-dynamodb",
    "app.kubernetes.io/managed-by": "pulumi"
}

const catalogLabels = {
    "app.kubernetes.io/name": "zephyr-app",
    "app.kubernetes.io/component": "catalog",
    "app.kubernetes.io/managed-by": "pulumi"
}

const checkoutLabels = {
    "app.kubernetes.io/name": "zephyr-app",
    "app.kubernetes.io/component": "checkout",
    "app.kubernetes.io/managed-by": "pulumi"
}

const checkoutDbLabels = {
    "app.kubernetes.io/name": "zephyr-app",
    "app.kubernetes.io/component": "checkout-redis",
    "app.kubernetes.io/managed-by": "pulumi"
}

const ordersLabels = {
    "app.kubernetes.io/name": "zephyr-app",
    "app.kubernetes.io/component": "orders",
    "app.kubernetes.io/managed-by": "pulumi"
}

const rabbitmqLabels = {
    "app.kubernetes.io/name": "zephyr-app",
    "app.kubernetes.io/component": "rabbitmq",
    "app.kubernetes.io/managed-by": "pulumi"
}

const uiLabels = {
    "app.kubernetes.io/name": "zephyr-app",
    "app.kubernetes.io/component": "ui",
    "app.kubernetes.io/managed-by": "pulumi"
}

// Create namespaces for the application components
const assetsNs = new k8s.core.v1.Namespace("assets-ns", {
    metadata: {
        labels: assetsLabels,
        name: "assets",
    },
}, { provider: eksProvider });

const cartsNs = new k8s.core.v1.Namespace("carts-ns", {
    metadata: {
        labels: cartsLabels,
        name: "carts",
    },
}, { provider: eksProvider });

const catalogNs = new k8s.core.v1.Namespace("catalog-ns", {
    metadata: {
        labels: catalogLabels,
        name: "catalog",
    },
}, { provider: eksProvider });

const checkoutNs = new k8s.core.v1.Namespace("checkout-ns", {
    metadata: {
        labels: checkoutLabels,
        name: "checkout",
    },
}, { provider: eksProvider });

const ordersNs = new k8s.core.v1.Namespace("orders-ns", {
    metadata: {
        labels: ordersLabels,
        name: "orders",
    },
}, { provider: eksProvider });

const rabbitmqNs = new k8s.core.v1.Namespace("rabbitmq-ns", {
    metadata: {
        labels: rabbitmqLabels,
        name: "rabbitmq",
    },
}, { provider: eksProvider });

const uiNs = new k8s.core.v1.Namespace("ui-ns", {
    metadata: {
        labels: uiLabels,
        name: "ui",
    },
}, { provider: eksProvider });

// Create service accounts for the application components
const assetsSa = new k8s.core.v1.ServiceAccount("assets-sa", {
    metadata: {
        labels: assetsLabels,
        name: "assets",
        namespace: assetsNs.metadata.name,
    },
}, { provider: eksProvider });

const cartsSa = new k8s.core.v1.ServiceAccount("carts-sa", {
    metadata: {
        labels: cartsLabels,
        name: "carts",
        namespace: cartsNs.metadata.name,
    },
}, { provider: eksProvider });

const catalogSa = new k8s.core.v1.ServiceAccount("catalog-sa", {
    metadata: {
        labels: catalogLabels,
        name: "catalog",
        namespace: catalogNs.metadata.name,
    },
}, { provider: eksProvider });

const checkoutSa = new k8s.core.v1.ServiceAccount("checkout-sa", {
    metadata: {
        labels: checkoutLabels,
        name: "checkout",
        namespace: checkoutNs.metadata.name,
    },
}, { provider: eksProvider });

const ordersSa = new k8s.core.v1.ServiceAccount("orders-sa", {
    metadata: {
        labels: ordersLabels,
        name: "orders",
        namespace: ordersNs.metadata.name,
    },
}, { provider: eksProvider });

const rabbitmqSa = new k8s.core.v1.ServiceAccount("rabbitmq-sa", {
    metadata: {
        labels: rabbitmqLabels,
        name: "rabbitmq",
        namespace: rabbitmqNs.metadata.name,
    },
}, { provider: eksProvider });

const uiSa = new k8s.core.v1.ServiceAccount("ui-sa", {
    metadata: {
        labels: uiLabels,
        name: "ui",
        namespace: uiNs.metadata.name,
    },
}, { provider: eksProvider });

// Create ConfigMaps for application components
const assetsConfigMap = new k8s.core.v1.ConfigMap("assets-configmap", {
    data: {
        PORT: "8080",
    },
    metadata: {
        labels: assetsLabels,
        name: "assets",
        namespace: assetsNs.metadata.name,
    },
}, { provider: eksProvider });

const cartsConfigMap = new k8s.core.v1.ConfigMap("carts-configmap", {
    data: {
        AWS_ACCESS_KEY_ID: "key",
        AWS_SECRET_ACCESS_KEY: "secret",
        CARTS_DYNAMODB_CREATETABLE: "true",
        CARTS_DYNAMODB_ENDPOINT: "http://carts-dynamodb:8000",
        CARTS_DYNAMODB_TABLENAME: "Items",
    },
    metadata: {
        labels: cartsLabels,
        name: "carts",
        namespace: cartsNs.metadata.name,
    },
}, { provider: eksProvider });

const catalogConfigMap = new k8s.core.v1.ConfigMap("catalog-configmap", {
    metadata: {
        labels: catalogLabels,
        name: "catalog",
        namespace: catalogNs.metadata.name,
    },
}, { provider: eksProvider });

const checkoutConfigMap = new k8s.core.v1.ConfigMap("checkout-configmap", {
    data: {
        ENDPOINTS_ORDERS: "http://orders.orders.svc:80",
        REDIS_URL: "redis://checkout-redis:6379",
    },
    metadata: {
        labels: checkoutLabels,
        name: "checkout",
        namespace: checkoutNs.metadata.name,
    },
}, { provider: eksProvider });

const ordersConfigMap = new k8s.core.v1.ConfigMap("orders-configmap", {
    data: {
        SPRING_PROFILES_ACTIVE: "mysql,rabbitmq",
        SPRING_RABBITMQ_HOST: "rabbitmq.rabbitmq.svc",
    },
    metadata: {
        labels: ordersLabels,
        name: "orders",
        namespace: ordersNs.metadata.name,
    },
}, { provider: eksProvider });

const rabbitmqConfigMap = new k8s.core.v1.ConfigMap("rabbitmq-configmap", {
    metadata: {
        labels: rabbitmqLabels,
        name: "rabbitmq",
        namespace: rabbitmqNs.metadata.name,
    },
}, { provider: eksProvider });

const uiConfigMap = new k8s.core.v1.ConfigMap("ui-configmap", {
    data: {
        ENDPOINTS_ASSETS: "http://assets.assets.svc:80",
        ENDPOINTS_CARTS: "http://carts.carts.svc:80",
        ENDPOINTS_CATALOG: "http://catalog.catalog.svc:80",
        ENDPOINTS_CHECKOUT: "http://checkout.checkout.svc:80",
        ENDPOINTS_ORDERS: "http://orders.orders.svc:80",
    },
    metadata: {
        labels: uiLabels,
        name: "ui",
        namespace: uiNs.metadata.name,
    },
}, { provider: eksProvider });

// Define some Secrets for application components
const catalogDbSecret = new k8s.core.v1.Secret("catalog-db-secret", {
    data: {
        name: "Y2F0YWxvZw==",
        password: "ZGVmYXVsdF9wYXNzd29yZA==",
        username: "Y2F0YWxvZ19tYXN0ZXI=",
    },
    stringData: {
        endpoint: catalogConnectionString,
    },
    metadata: {
        labels: catalogLabels,
        name: "catalog-db",
        namespace: catalogNs.metadata.name,
    },
}, { provider: eksProvider });

const ordersDbSecret = new k8s.core.v1.Secret("orders-db-secret", {
    data: {
        name: "b3JkZXJz",
        password: "ZGVmYXVsdF9wYXNzd29yZA==",
        username: "b3JkZXJzX21hc3Rlcg==",
    },
    stringData: {
        url: ordersConnectionString,
    },
    metadata: {
        labels: ordersLabels,
        name: "orders-db",
        namespace: ordersNs.metadata.name,
    },
}, { provider: eksProvider });

// Expose application components via Services
const assetsService = new k8s.core.v1.Service("assets-service", {
    metadata: {
        labels: assetsLabels,
        name: "assets",
        namespace: assetsNs.metadata.name,
    },
    spec: {
        ports: [{
            name: "http",
            port: 80,
            protocol: "TCP",
            targetPort: "http",
        }],
        selector: assetsLabels,
        type: "ClusterIP",
    },
}, { provider: eksProvider });

const cartsService = new k8s.core.v1.Service("carts-service", {
    metadata: {
        labels: cartsLabels,
        name: "carts",
        namespace: cartsNs.metadata.name,
    },
    spec: {
        ports: [{
            name: "http",
            port: 80,
            protocol: "TCP",
            targetPort: "http",
        }],
        selector: cartsLabels,
        type: "ClusterIP",
    },
}, { provider: eksProvider });

const cartsDynamodbService = new k8s.core.v1.Service("carts-dynamodb-service", {
    metadata: {
        labels: cartsDbLabels,
        name: "carts-dynamodb",
        namespace: cartsNs.metadata.name,
    },
    spec: {
        ports: [{
            name: "dynamodb",
            port: 8000,
            protocol: "TCP",
            targetPort: "dynamodb",
        }],
        selector: cartsDbLabels,
        type: "ClusterIP",
    },
}, { provider: eksProvider });

const catalogService = new k8s.core.v1.Service("catalog-service", {
    metadata: {
        labels: catalogLabels,
        name: "catalog",
        namespace: catalogNs.metadata.name,
    },
    spec: {
        ports: [{
            name: "http",
            port: 80,
            protocol: "TCP",
            targetPort: "http",
        }],
        selector: catalogLabels,
        type: "ClusterIP",
    },
}, { provider: eksProvider });

const checkoutService = new k8s.core.v1.Service("checkout-service", {
    metadata: {
        labels: checkoutLabels,
        name: "checkout",
        namespace: checkoutNs.metadata.name,
    },
    spec: {
        ports: [{
            name: "http",
            port: 80,
            protocol: "TCP",
            targetPort: "http",
        }],
        selector: checkoutLabels,
        type: "ClusterIP",
    },
}, { provider: eksProvider });

const checkoutRedisService = new k8s.core.v1.Service("checkout-redis-service", {
    metadata: {
        labels: checkoutDbLabels,
        name: "checkout-redis",
        namespace: checkoutNs.metadata.name,
    },
    spec: {
        ports: [{
            name: "redis",
            port: 6379,
            protocol: "TCP",
            targetPort: "redis",
        }],
        selector: checkoutDbLabels,
        type: "ClusterIP",
    },
}, { provider: eksProvider });

const ordersService = new k8s.core.v1.Service("orders-service", {
    metadata: {
        labels: ordersLabels,
        name: "orders",
        namespace: ordersNs.metadata.name,
    },
    spec: {
        ports: [{
            name: "http",
            port: 80,
            protocol: "TCP",
            targetPort: "http",
        }],
        selector: ordersLabels,
        type: "ClusterIP",
    },
}, { provider: eksProvider });

const rabbitmqService = new k8s.core.v1.Service("rabbitmq-service", {
    metadata: {
        labels: rabbitmqLabels,
        name: "rabbitmq",
        namespace: rabbitmqNs.metadata.name,
    },
    spec: {
        ports: [
            {
                name: "amqp",
                port: 5672,
                protocol: "TCP",
                targetPort: "amqp",
            },
            {
                name: "http",
                port: 15672,
                protocol: "TCP",
                targetPort: "http",
            },
        ],
        selector: rabbitmqLabels,
        type: "ClusterIP",
    },
}, { provider: eksProvider });

const uiService = new k8s.core.v1.Service("ui-service", {
    metadata: {
        labels: uiLabels,
        name: "ui",
        namespace: uiNs.metadata.name,
    },
    spec: {
        ports: [{
            name: "http",
            port: 80,
            protocol: "TCP",
            targetPort: "http",
        }],
        selector: uiLabels,
        type: "ClusterIP",
    },
}, { provider: eksProvider });

// Expose the UI via a load balancer for external access
const uiLbService = new k8s.core.v1.Service("ui-lb-service", {
    metadata: {
        labels: uiLabels,
        name: "ui-lb",
        namespace: uiNs.metadata.name,
    },
    spec: {
        ports: [{
            name: "http",
            port: 80,
            protocol: "TCP",
            targetPort: "http",
        }],
        selector: uiLabels,
        type: "LoadBalancer",
    },
}, { provider: eksProvider });

const repository = new awsx.ecr.Repository("repository", {
    forceDelete: true,
});

// Create Deployments for the various application components
const assetsDeployment = new k8s.apps.v1.Deployment("assets-deployment", {
    metadata: {
        labels: assetsLabels,
        name: "assets",
        namespace: assetsNs.metadata.name,
    },
    spec: {
        replicas: 1,
        selector: {
            matchLabels: assetsLabels,
        },
        template: {
            metadata: {
                annotations: {
                    "prometheus.io/path": "/metrics",
                    "prometheus.io/port": "8080",
                    "prometheus.io/scrape": "true",
                },
                labels: assetsLabels,
            },
            spec: {
                containers: [{
                    envFrom: [{
                        configMapRef: {
                            name: assetsConfigMap.metadata.name,
                        },
                    }],
                    image: "public.ecr.aws/aws-containers/retail-store-sample-assets:0.2.0",
                    imagePullPolicy: "IfNotPresent",
                    livenessProbe: {
                        httpGet: {
                            path: "/health.html",
                            port: 8080,
                        },
                        initialDelaySeconds: 30,
                        periodSeconds: 3,
                    },
                    name: "assets",
                    ports: [{
                        containerPort: 8080,
                        name: "http",
                        protocol: "TCP",
                    }],
                    resources: {
                        limits: {
                            memory: "128Mi",
                        },
                        requests: {
                            cpu: "128m",
                            memory: "128Mi",
                        },
                    },
                    securityContext: {
                        capabilities: {
                            drop: ["ALL"],
                        },
                        readOnlyRootFilesystem: false,
                    },
                    volumeMounts: [{
                        mountPath: "/tmp",
                        name: "tmp-volume",
                    }],
                }],
                securityContext: {},
                serviceAccountName: assetsSa.metadata.name,
                volumes: [{
                    emptyDir: {
                        medium: "Memory",
                    },
                    name: "tmp-volume",
                }],
            },
        },
    },
}, { provider: eksProvider });

const cartsDeployment = new k8s.apps.v1.Deployment("carts-deployment", {
    metadata: {
        labels: cartsLabels,
        name: "carts",
        namespace: cartsNs.metadata.name,
    },
    spec: {
        replicas: 1,
        selector: {
            matchLabels: cartsLabels,
        },
        template: {
            metadata: {
                annotations: {
                    "prometheus.io/path": "/actuator/prometheus",
                    "prometheus.io/port": "80801",
                    "prometheus.io/scrape": "true",
                },
                labels: cartsLabels,
            },
            spec: {
                containers: [{
                    env: [
                        {
                            name: "JAVA_OPTS",
                            value: "-XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/urandom",
                        },
                        {
                            name: "SPRING_PROFILES_ACTIVE",
                            value: "dynamodb",
                        },
                    ],
                    envFrom: [{
                        configMapRef: {
                            name: cartsConfigMap.metadata.name,
                        },
                    }],
                    image: "public.ecr.aws/aws-containers/retail-store-sample-cart:0.2.0",
                    imagePullPolicy: "IfNotPresent",
                    livenessProbe: {
                        httpGet: {
                            path: "/actuator/health/liveness",
                            port: 8080,
                        },
                        initialDelaySeconds: 45,
                        periodSeconds: 3,
                    },
                    name: "carts",
                    ports: [{
                        containerPort: 8080,
                        name: "http",
                        protocol: "TCP",
                    }],
                    resources: {
                        limits: {
                            memory: "512Mi",
                        },
                        requests: {
                            cpu: "128m",
                            memory: "512Mi",
                        },
                    },
                    securityContext: {
                        capabilities: {
                            drop: ["ALL"],
                        },
                        readOnlyRootFilesystem: true,
                        runAsNonRoot: true,
                        runAsUser: 1000,
                    },
                    volumeMounts: [{
                        mountPath: "/tmp",
                        name: "tmp-volume",
                    }],
                }],
                securityContext: {
                    fsGroup: 1000,
                },
                serviceAccountName: cartsSa.metadata.name,
                volumes: [{
                    emptyDir: {
                        medium: "Memory",
                    },
                    name: "tmp-volume",
                }],
            },
        },
    },
}, { provider: eksProvider });

const cartsDynamodbDeployment = new k8s.apps.v1.Deployment("carts-dynamodb-deployment", {
    metadata: {
        labels: cartsDbLabels,
        name: "carts-dynamodb",
        namespace: cartsNs.metadata.name,
    },
    spec: {
        replicas: 1,
        selector: {
            matchLabels: cartsDbLabels,
        },
        template: {
            metadata: {
                labels: cartsDbLabels,
            },
            spec: {
                containers: [{
                    image: "amazon/dynamodb-local:1.13.1",
                    imagePullPolicy: "IfNotPresent",
                    name: "dynamodb",
                    ports: [{
                        containerPort: 8000,
                        name: "dynamodb",
                        protocol: "TCP",
                    }],
                }],
            },
        },
    },
}, { provider: eksProvider });

const catalogDeployment = new k8s.apps.v1.Deployment("catalog-deployment", {
    metadata: {
        labels: catalogLabels,
        name: "catalog",
        namespace: catalogNs.metadata.name,
    },
    spec: {
        replicas: 1,
        selector: {
            matchLabels: catalogLabels,
        },
        template: {
            metadata: {
                annotations: {
                    "prometheus.io/path": "/metrics",
                    "prometheus.io/port": "8080",
                    "prometheus.io/scrape": "true",
                },
                labels: catalogLabels,
            },
            spec: {
                containers: [{
                    env: [
                        {
                            name: "DB_ENDPOINT",
                            valueFrom: {
                                secretKeyRef: {
                                    key: "endpoint",
                                    name: catalogDbSecret.metadata.name,
                                },
                            },
                        },
                        {
                            name: "DB_USER",
                            valueFrom: {
                                secretKeyRef: {
                                    key: "username",
                                    name: catalogDbSecret.metadata.name,
                                },
                            },
                        },
                        {
                            name: "DB_PASSWORD",
                            valueFrom: {
                                secretKeyRef: {
                                    key: "password",
                                    name: catalogDbSecret.metadata.name,
                                },
                            },
                        },
                        {
                            name: "DB_READ_ENDPOINT",
                            valueFrom: {
                                secretKeyRef: {
                                    key: "endpoint",
                                    name: catalogDbSecret.metadata.name,
                                },
                            },
                        },
                        {
                            name: "DB_NAME",
                            valueFrom: {
                                secretKeyRef: {
                                    key: "name",
                                    name: catalogDbSecret.metadata.name,
                                },
                            },
                        },
                    ],
                    envFrom: [{
                        configMapRef: {
                            name: catalogConfigMap.metadata.name,
                        },
                    }],
                    image: "public.ecr.aws/aws-containers/retail-store-sample-catalog:0.2.0",
                    imagePullPolicy: "IfNotPresent",
                    livenessProbe: {
                        httpGet: {
                            path: "/health",
                            port: 8080,
                        },
                        initialDelaySeconds: 30,
                        periodSeconds: 3,
                    },
                    name: "catalog",
                    ports: [{
                        containerPort: 8080,
                        name: "http",
                        protocol: "TCP",
                    }],
                    readinessProbe: {
                        httpGet: {
                            path: "/health",
                            port: 8080,
                        },
                        periodSeconds: 5,
                        successThreshold: 3,
                    },
                    resources: {
                        limits: {
                            memory: "256Mi",
                        },
                        requests: {
                            cpu: "128m",
                            memory: "256Mi",
                        },
                    },
                    securityContext: {
                        capabilities: {
                            drop: ["ALL"],
                        },
                        readOnlyRootFilesystem: true,
                        runAsNonRoot: true,
                        runAsUser: 1000,
                    },
                    volumeMounts: [{
                        mountPath: "/tmp",
                        name: "tmp-volume",
                    }],
                }],
                securityContext: {
                    fsGroup: 1000,
                },
                serviceAccountName: catalogSa.metadata.name,
                volumes: [{
                    emptyDir: {
                        medium: "Memory",
                    },
                    name: "tmp-volume",
                }],
            },
        },
    },
}, { provider: eksProvider });

const checkoutDeployment = new k8s.apps.v1.Deployment("checkout-deployment", {
    metadata: {
        labels: checkoutLabels,
        name: "checkout",
        namespace: checkoutNs.metadata.name,
    },
    spec: {
        replicas: 1,
        selector: {
            matchLabels: checkoutLabels,
        },
        template: {
            metadata: {
                annotations: {
                    "prometheus.io/path": "/metrics",
                    "prometheus.io/port": "8080",
                    "prometheus.io/scrape": "true",
                },
                labels: checkoutLabels,
            },
            spec: {
                containers: [{
                    envFrom: [{
                        configMapRef: {
                            name: checkoutConfigMap.metadata.name,
                        },
                    }],
                    image: "public.ecr.aws/aws-containers/retail-store-sample-checkout:0.2.0",
                    imagePullPolicy: "IfNotPresent",
                    livenessProbe: {
                        httpGet: {
                            path: "/health",
                            port: 8080,
                        },
                        initialDelaySeconds: 30,
                        periodSeconds: 3,
                    },
                    name: "checkout",
                    ports: [{
                        containerPort: 8080,
                        name: "http",
                        protocol: "TCP",
                    }],
                    resources: {
                        limits: {
                            memory: "256Mi",
                        },
                        requests: {
                            cpu: "128m",
                            memory: "256Mi",
                        },
                    },
                    securityContext: {
                        capabilities: {
                            drop: ["ALL"],
                        },
                        readOnlyRootFilesystem: true,
                        runAsNonRoot: true,
                        runAsUser: 1000,
                    },
                    volumeMounts: [{
                        mountPath: "/tmp",
                        name: "tmp-volume",
                    }],
                }],
                securityContext: {
                    fsGroup: 1000,
                },
                serviceAccountName: checkoutSa.metadata.name,
                volumes: [{
                    emptyDir: {
                        medium: "Memory",
                    },
                    name: "tmp-volume",
                }],
            },
        },
    },
}, { provider: eksProvider });

const checkoutRedisDeployment = new k8s.apps.v1.Deployment("checkout-redis-deployment", {
    metadata: {
        labels: checkoutDbLabels,
        name: "checkout-redis",
        namespace: checkoutNs.metadata.name,
    },
    spec: {
        replicas: 1,
        selector: {
            matchLabels: checkoutDbLabels,
        },
        template: {
            metadata: {
                labels: checkoutDbLabels,
            },
            spec: {
                containers: [{
                    image: "redis:6.0-alpine",
                    imagePullPolicy: "IfNotPresent",
                    name: "redis",
                    ports: [{
                        containerPort: 6379,
                        name: "redis",
                        protocol: "TCP",
                    }],
                }],
            },
        },
    },
}, { provider: eksProvider });

const ordersDeployment = new k8s.apps.v1.Deployment("orders-deployment", {
    metadata: {
        labels: ordersLabels,
        name: "orders",
        namespace: ordersNs.metadata.name,
    },
    spec: {
        replicas: 1,
        selector: {
            matchLabels: ordersLabels,
        },
        template: {
            metadata: {
                annotations: {
                    "prometheus.io/path": "/actuator/prometheus",
                    "prometheus.io/port": "8080",
                    "prometheus.io/scrape": "true",
                },
                labels: ordersLabels,
            },
            spec: {
                containers: [{
                    env: [
                        {
                            name: "JAVA_OPTS",
                            value: "-XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/urandom",
                        },
                        {
                            name: "SPRING_DATASOURCE_WRITER_URL",
                            valueFrom: {
                                secretKeyRef: {
                                    key: "url",
                                    name: ordersDbSecret.metadata.name,
                                },
                            },
                        },
                        {
                            name: "SPRING_DATASOURCE_WRITER_USERNAME",
                            valueFrom: {
                                secretKeyRef: {
                                    key: "username",
                                    name: ordersDbSecret.metadata.name,
                                },
                            },
                        },
                        {
                            name: "SPRING_DATASOURCE_WRITER_PASSWORD",
                            valueFrom: {
                                secretKeyRef: {
                                    key: "password",
                                    name: ordersDbSecret.metadata.name,
                                },
                            },
                        },
                        {
                            name: "SPRING_DATASOURCE_READER_URL",
                            valueFrom: {
                                secretKeyRef: {
                                    key: "url",
                                    name: ordersDbSecret.metadata.name,
                                },
                            },
                        },
                        {
                            name: "SPRING_DATASOURCE_READER_USERNAME",
                            valueFrom: {
                                secretKeyRef: {
                                    key: "username",
                                    name: ordersDbSecret.metadata.name,
                                },
                            },
                        },
                        {
                            name: "SPRING_DATASOURCE_READER_PASSWORD",
                            valueFrom: {
                                secretKeyRef: {
                                    key: "password",
                                    name: ordersDbSecret.metadata.name,
                                },
                            },
                        },
                    ],
                    envFrom: [{
                        configMapRef: {
                            name: ordersConfigMap.metadata.name,
                        },
                    }],
                    image: "public.ecr.aws/aws-containers/retail-store-sample-orders:0.2.0",
                    imagePullPolicy: "IfNotPresent",
                    livenessProbe: {
                        httpGet: {
                            path: "/actuator/health/liveness",
                            port: 8080,
                        },
                        initialDelaySeconds: 45,
                        periodSeconds: 3,
                    },
                    name: "orders",
                    ports: [{
                        containerPort: 8080,
                        name: "http",
                        protocol: "TCP",
                    }],
                    readinessProbe: {
                        httpGet: {
                            path: "/actuator/health/liveness",
                            port: 8080,
                        },
                        periodSeconds: 5,
                        successThreshold: 3,
                    },
                    resources: {
                        limits: {
                            memory: "512Mi",
                        },
                        requests: {
                            cpu: "128m",
                            memory: "512Mi",
                        },
                    },
                    securityContext: {
                        capabilities: {
                            drop: ["ALL"],
                        },
                        readOnlyRootFilesystem: true,
                        runAsNonRoot: true,
                        runAsUser: 1000,
                    },
                    volumeMounts: [{
                        mountPath: "/tmp",
                        name: "tmp-volume",
                    }],
                }],
                securityContext: {
                    fsGroup: 1000,
                },
                serviceAccountName: ordersSa.metadata.name,
                volumes: [{
                    emptyDir: {
                        medium: "Memory",
                    },
                    name: "tmp-volume",
                }],
            },
        },
    },
}, { provider: eksProvider });

const rabbitmqDeployment = new k8s.apps.v1.Deployment("rabbitmq-deployment", {
    metadata: {
        labels: rabbitmqLabels,
        name: "rabbitmq",
        namespace: rabbitmqNs.metadata.name,
    },
    spec: {
        replicas: 1,
        selector: {
            matchLabels: rabbitmqLabels,
        },
        template: {
            metadata: {
                labels: rabbitmqLabels,
            },
            spec: {
                containers: [{
                    image: "rabbitmq:3-management",
                    imagePullPolicy: "IfNotPresent",
                    name: "rabbitmq",
                    ports: [
                        {
                            containerPort: 5672,
                            name: "amqp",
                            protocol: "TCP",
                        },
                        {
                            containerPort: 15672,
                            name: "http",
                            protocol: "TCP",
                        },
                    ],
                }],
            },
        },
    },
}, { provider: eksProvider });

const uiImage = new awsx.ecr.Image("ui-image", {
    repositoryUrl: repository.url,
    dockerfile: "../images/java17/Dockerfile",
    path: "../src/ui",
    args: {
        JAR_PATH: "target/ui-0.0.1-SNAPSHOT.jar",
    },
    env: {
        DOCKER_BUILDKIT: "1",
        DOCKER_DEFAULT_PLATFORM: "linux/amd64"
    }
});

const uiDeployment = new k8s.apps.v1.Deployment("ui-deployment", {
    metadata: {
        labels: uiLabels,
        name: "ui",
        namespace: uiNs.metadata.name,
    },
    spec: {
        replicas: 1,
        selector: {
            matchLabels: uiLabels,
        },
        template: {
            metadata: {
                annotations: {
                    "prometheus.io/path": "/actuator/prometheus",
                    "prometheus.io/port": "8080",
                    "prometheus.io/scrape": "true",
                },
                labels: uiLabels,
            },
            spec: {
                containers: [{
                    env: [{
                        name: "JAVA_OPTS",
                        value: "-XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/urandom",
                    }],
                    envFrom: [{
                        configMapRef: {
                            name: uiConfigMap.metadata.name,
                        },
                    }],
                    image: uiImage.imageUri,
                    imagePullPolicy: "IfNotPresent",
                    livenessProbe: {
                        httpGet: {
                            path: "/actuator/health/liveness",
                            port: 8080,
                        },
                        initialDelaySeconds: 45,
                        periodSeconds: 20,
                    },
                    name: "ui",
                    ports: [{
                        containerPort: 8080,
                        name: "http",
                        protocol: "TCP",
                    }],
                    resources: {
                        limits: {
                            memory: "512Mi",
                        },
                        requests: {
                            cpu: "128m",
                            memory: "512Mi",
                        },
                    },
                    securityContext: {
                        capabilities: {
                            add: ["NET_BIND_SERVICE"],
                            drop: ["ALL"],
                        },
                        readOnlyRootFilesystem: true,
                        runAsNonRoot: true,
                        runAsUser: 1000,
                    },
                    volumeMounts: [{
                        mountPath: "/tmp",
                        name: "tmp-volume",
                    }],
                }],
                securityContext: {
                    fsGroup: 1000,
                },
                serviceAccountName: uiSa.metadata.name,
                volumes: [{
                    emptyDir: {
                        medium: "Memory",
                    },
                    name: "tmp-volume",
                }],
            },
        },
    },
}, { provider: eksProvider });
