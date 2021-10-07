#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { WebInfraStack } from '../lib/web-infra-stack';

const app = new cdk.App();

// function requiredContextVar(propName: string): string{
    
//     let val  = app.node.tryGetContext(propName);
//     console.log(val)
//     if (!val) {
//         throw new Error("Required environment variables");
//     }
//     return val;
// }

// let envProps =  app.node.tryGetContext(requiredContextVar("env"));
// console.log(envProps)

new WebInfraStack(app, 'WebInfraStack', {
    env: {
        account: process.env.AWS_ACCOUNT_PILOT,
        region:  process.env.AWS_REGION_PILOT
    }
});
