import type { AdminViewServerProps } from 'payload'

import React from 'react'

export function RegressionDetailView({ params }: AdminViewServerProps) {
  const paramValue = params?.segments?.[1]
  return (
    <div
      id="regression-detail-view"
      style={{
        marginTop: 'calc(var(--base) * 2)',
        paddingLeft: 'var(--gutter-h)',
        paddingRight: 'var(--gutter-h)',
      }}
    >
      <h1>Regression Detail View</h1>
      <p>Registered at path: /regression-repro/:id</p>
      <p>
        Received id param: <span id="regression-detail-id">{paramValue || 'None'}</span>
      </p>
    </div>
  )
}
