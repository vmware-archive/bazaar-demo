# Bazaar demo
This Demo has been prepared to work with Bazaar `v0.0.3`.
You need both PAS and PKS to run this demo.

## Preparation
These steps should be completed before delivering the demo

1. Clone kibosh-sample repo
    - https://github.com/cf-platform-eng/kibosh-sample
    - We will use it to get sample Helm charts

1. Install Bazaar CLI
    - https://github.com/cf-platform-eng/kibosh/releases

1. Download Bazaar tile
    - https://storage.googleapis.com/kibosh-public/bazaar-chart-0.0.3.pivotal

1. Install Bazaar tile
    - Upload to Ops Manager
    - Configure tile with PKS cluster credentials.
      - All credentials can be extracted from the kubeconfig.
      - Cluster CA certificate: remember kubeconfig has it encoded in base64 so you have to decode it.
      - K8S API endpoint: with `http://`.
      - Cluster JWT token: locate the user uuid assigned to your cluster, then look for its token.
    - Apply changes
    - Before creating any service with Bazaar
      - Make sure that the k8s cluster has a storage class with name standard

1. Install Minio app utils
    -

## Bazaar demo
First set of steps to show how to use Bazaar to manage helm charts and add services to the Marketplace

1. Get Bazaar API Credentials
    - Go to the Bazaar tile -> Credentials tab -> Bazaar Api Credentials: get User and Password
    - We will use these credentials with the Bazaar CLI

1. List Charts with Bazaar CLI:
    - Run this command:
    ```
    bazaarcli -t http://bazaar.<SYSTEM-DOMAIN> -u <BAZAAR-API-USER> -p <BAZAAR-API-PASSWORD> list
    ```

    - Example:
    ```
    bazaarcli -t http://bazaar.run.haas-141.pez.pivotal.io -u 'bazaar_api_admin' -p 'jHO_zfuTx3K_YcF0PB6oWOEOfdSsGitQ' list
    ```

1. Save Chart with Bazaar CLI:
    - Choose one of the Sample Charts from the `kibosh-sample` repo (cloned during the prep steps).
      - If the Minio Chart hasn't been saved yet, then use that one since you'll need it later in this demo.
      - If you want to use another Helm Chart from the Stable repo you will have to do a few customizations before Bazaar can use it. At least:
        - Service must be `type: LoadBalancer`
        - Need plans directory and some plans
    - Run this command:
    ```
    bazaarcli -t http://bazaar.<SYSTEM-DOMAIN> -u <BAZAAR-API-USER> -p <BAZAAR-API-PASSWORD> save chart.tgz
    ```
    - Example:
    ```
    bazaarcli -t http://bazaar.run.haas-141.pez.pivotal.io -u 'bazaar_api_admin' -p 'jHO_zfuTx3K_YcF0PB6oWOEOfdSsGitQ' save ./sample-charts/mysql-0.8.2.tgz
    ```
    - This registers the services in the Marketplace and associates it to the Bazaar broker.

1. Enable service in the marketplace
    - Enable service access to PAS Marketplace users:
    ```
    cf enable-service-access mysql
    ```
    - Check the service is now available in the Marketplace via UI or CLI:
    ```
    cf marketplace
    ```
    - Reflect on the value provided by enabling Bazaar users (devs, devops) to add new services in the Marketplace that are deployed in k8s (PKS) and without having to deploy an entire tile per service. Just using standard Helm Charts.

## Minio Service Demo
Set of steps to showcase how Bazaar services are consumed, same as any other service in the Marketplace. We will use Minio service as example.

1. Create Mino service
    - Use AppsManager UI or run the following command:
    ```
    cf cs -h minio default Minio
    ```
    - Check that minio deployment, por and service are successfully created in k8s. Bazaar creates a new namespace with `kibosh` prefix.
    ```
    kubectl get pod,svc,deploy -n kibosh-266422cf-122c-44f2-8676-c0d135b95917
    ```
    Yo should get an output like this:
    ```
    NAME                                                                  READY     STATUS    RESTARTS   AGE
    pod/kibosh-266422cf-122c-44f2-8676-c0d135b95917-minio-7f96f457v74gv   1/1       Running   0          3d

    NAME                                                        TYPE           CLUSTER-IP       EXTERNAL-IP     PORT(S)          AGE
    service/kibosh-266422cf-122c-44f2-8676-c0d135b95917-minio   LoadBalancer   10.100.200.254   10.195.38.143   9000:31976/TCP   3d

    NAME                                                                      DESIRED   CURRENT   UP-TO-DATE   AVAILABLE   AGE
    deployment.extensions/kibosh-266422cf-122c-44f2-8676-c0d135b95917-minio   1         1         1            1           3d
    ```

1. Prepare Minio app
    - Make sure you have `node` and `npm` installed
    - Install the Angular CLI:
    ```
    npm install -g angular-cli
    ```
    - Install Minio client: https://www.minio.io/downloads.html#download-client
    - Go inside the `minio-demo` folder of this repo.
    ```
    cd minio-demo
    ```
    - Install all necessary packages
    ```
    npm install --save express body-parser multer minio bootstrap font-awesome
    ```
    - Build the Angular UI
    ```
    ng build
    ```

1. Deploy `minio-demo` app to PAS
    - Check the `manifest.yml` and change any name or setting
    - CF PUSH the app
    ```
    cf push
    ```

1. Test application
    - Open app URL in the browser
    - You should see a screen like this:
    ![minio-emo-image](./images/minio-demo.png)
    - The first time you access the app after deployment there should be no files
    - Copy the `mc` command and run it. It should look like this.
    ```
    mc config host add minio http://10.195.38.145:9000 'AKIAIOSFODNN7EXAMPLE' 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
    ```
    Now you have minio server registered
    - Test to add some files to the `minio-demo` bucket, which was automatically created by the `minio-demo` app you deployed. Example:
    ```
    mc cp sample-file minio/minio-demo
    ```
    - Refresh your browser, the contents of the bucket should be updated with the new file you uploaded.
    - BONUS: Check that the files are in the persistent disk mounted from the minio pod in k8s:
    ```
    kubectl exec -it kibosh-266422cf-122c-44f2-8676-c0d135b95917-minio-7f96f457v74gv -n kibosh-266422cf-122c-44f2-8676-c0d135b95917 -- /bin/sh
    ls -lart /export/minio-demo/
    ```

## Cleanup after demo
These steps are recommended so that the next PA finds the environment more ready to follow all the above steps.

1. Remove any Chart from Bazaar except the Minio Chart.
    - Run this command for each chart:
    ```
    bazaarcli -t http://bazaar.<SYSTEM-DOMAIN> -u <BAZAAR-API-USER> -p <BAZAAR-API-PASSWORD> delete mysql
    ```
    - Example:
    ```
    bazaarcli -t http://bazaar.run.haas-141.pez.pivotal.io -u 'bazaar_api_admin' -p 'jHO_zfuTx3K_YcF0PB6oWOEOfdSsGitQ' delete mysql
    ```
