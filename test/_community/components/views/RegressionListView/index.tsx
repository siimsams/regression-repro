import type { AdminViewServerProps } from 'payload'

import React from 'react'

export function RegressionListView(_props: AdminViewServerProps) {
  return (
    <div
      id="regression-list-view"
      style={{
        marginTop: 'calc(var(--base) * 2)',
        paddingLeft: 'var(--gutter-h)',
        paddingRight: 'var(--gutter-h)',
      }}
    >
      <h1>Regression List View</h1>
      <p>Registered at path: /regression-repro (no exact flag)</p>
    </div>
  )
}
