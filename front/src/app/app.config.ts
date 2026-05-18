/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client/core';
import { inject } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { environment } from '@env';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideApollo(() => ({
      link: inject(HttpLink).create({ uri: `${environment.apiUrl}/graphql` }),
      cache: new InMemoryCache({
        typePolicies: {
          Account: {
            keyFields: ['id'],
          },

          Robot: {
            keyFields: ['id'],
          },

          Query: {
            fields: {
              robotsByAccount: {
                keyArgs: ['accountId'],
                merge(existing = [], incoming) {
                  return incoming;
                },
              },

              accounts: {
                merge(existing = [], incoming) {
                  return incoming;
                },
              },
            },
          },
        },
      }),
    })),
  ],
};
