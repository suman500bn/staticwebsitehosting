import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as s3Deployment from '@aws-cdk/aws-s3-deployment';
import * as route53 from '@aws-cdk/aws-route53';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as acm from '@aws-cdk/aws-certificatemanager';
import * as targets from '@aws-cdk/aws-route53-targets';
import * as cloudwatch from "@aws-cdk/aws-cloudwatch";
import * as iam from '@aws-cdk/aws-iam';
import * as wafv2 from '@aws-cdk/aws-wafv2';



export class WebInfraStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const zone = route53.HostedZone.fromLookup(this, 'Zone', { domainName: 'hbomaxtest.com' });

    const siteDomain = "joinapp.hbomaxtest.com";

    // Creating cloudfront origin access identity
    const cloudfrontOAI = new cloudfront.OriginAccessIdentity(this, 'cloudfront-OAI', {
      comment: `OAI for hbo hosted static website`
    });

    // Output to cloud fromation template
    new cdk.CfnOutput(this, 'Site', { value: 'https://' + siteDomain });
    
    // Bucket creation
    const myBucket = new s3.Bucket(this, "hbomax-website-bucket", {
      bucketName: siteDomain,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,        
      websiteIndexDocument: "index.html",
      cors: [
        {
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.POST,
            s3.HttpMethods.PUT,
          ],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
        }
        
      ]
   });

    // Adding OAI to bucket
    myBucket.addToResourcePolicy(new iam.PolicyStatement({
      actions: ['s3:GetObject'],
      resources: [myBucket.arnForObjects('*')],
      principals: [new iam.CanonicalUserPrincipal(cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId)]
    }));

    new cdk.CfnOutput(this, 'Bucket', { value: myBucket.bucketName });

      /**
     * List available Managed Rule Groups using AWS CLI
     * aws wafv2 list-available-managed-rule-groups --scope CLOUDFRONT
     */
    

    const wafAclCloudFront = new wafv2.CfnWebACL(this, "WafCloudFront", {
      defaultAction: { allow: {} },
      /**
       * The scope of this Web ACL.
       * Valid options: CLOUDFRONT, REGIONAL.
       * For CLOUDFRONT, you must create your WAFv2 resources
       * in the US East (N. Virginia) Region, us-east-1
       */
      scope: "CLOUDFRONT",
      // Defines and enables Amazon CloudWatch metrics and web request sample collection.
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        metricName: "waf-cloudfront",
        sampledRequestsEnabled: true
      },
      description: "WAFv2 ACL for CloudFront",
      name: "waf-cloudfront"
      //rules: ['allow list of ip address']
    }); // wafv2.CfnWebACL

    // TLS certificate
    const certificateArn = new acm.DnsValidatedCertificate(this, 'SiteCertificate', {
      domainName: siteDomain,
      hostedZone: zone,
      region: 'us-east-1', // Cloudfront only checks this region for certificates.
    }).certificateArn;
    
    new cdk.CfnOutput(this, 'Certificate', { value: certificateArn });

    // Specifies you want viewers to use HTTPS & TLS v1.1 to request your objects
    const viewerCertificate = cloudfront.ViewerCertificate.fromAcmCertificate({
      certificateArn: certificateArn,
      env: {
        region: cdk.Aws.REGION,
        account: cdk.Aws.ACCOUNT_ID
      },
      node: this.node,
      stack: cdk.Stack.of(this),
      metricDaysToExpiry: () =>
        new cloudwatch.Metric({
          namespace: "TLS Viewer Certificate Validity",
          metricName: "TLS Viewer Certificate Expired",
        }),
    },
      {
        sslMethod: cloudfront.SSLMethod.SNI,
        securityPolicy: cloudfront.SecurityPolicyProtocol.TLS_V1_1_2016,
        aliases: [siteDomain]
      })

      // CloudFront distribution
    const distribution = new cloudfront.CloudFrontWebDistribution(this, 'SiteDistribution', {
      //viewerCertificate,
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: myBucket,
            originAccessIdentity: cloudfrontOAI
          },
          behaviors: [{
            isDefaultBehavior: true,
            compress: true,
            allowedMethods: cloudfront.CloudFrontAllowedMethods.GET_HEAD_OPTIONS,
          }],
        }
      ],

      webACLId: wafAclCloudFront.attrArn 
    });
    new cdk.CfnOutput(this, 'DistributionId', { value: distribution.distributionId });

    // // Route53 alias record for the CloudFront distribution
    // new route53.ARecord(this, 'SiteAliasRecord', {
    //   recordName: siteDomain,
    //   target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
    //   zone
    // });

   new s3Deployment.BucketDeployment(this, "deployStaticWebsite", {
    sources: [s3Deployment.Source.asset("../website")],
    destinationBucket: myBucket,
    distribution,
    distributionPaths: ['/*'], 
  });

  
  }
}
