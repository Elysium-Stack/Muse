{{- define "muse.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "muse.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{- define "muse.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "muse.labels" -}}
helm.sh/chart: {{ include "muse.chart" . }}
{{ include "muse.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{- define "muse.selectorLabels" -}}
app.kubernetes.io/name: {{ include "muse.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{- define "muse.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "muse.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Secret name: existingSecret when supplied, else the chart-managed secret.
*/}}
{{- define "muse.secretName" -}}
{{- if .Values.secrets.existingSecret -}}
{{- .Values.secrets.existingSecret -}}
{{- else -}}
{{- include "muse.fullname" . -}}
{{- end -}}
{{- end }}

{{/*
muse.dbPasswordSecretName: name of the k8s Secret that holds the Postgres password.

For Bitnami-backed Postgres (postgresql.enabled) this defaults to the
auto-created secret (<fullname>-postgresql) so no explicit existingSecret
is required. Falls back to a user-supplied existingSecret if set.

Priority:
  postgresql.enabled  → postgresql.auth.existingSecret || "<fullname>-postgresql"
  external            → empty (DATABASE_URL comes from secrets.DATABASE_URL in the Secret)
*/}}
{{- define "muse.dbPasswordSecretName" -}}
{{- if (.Values.postgresql).enabled -}}
{{- default (printf "%s-postgresql" (include "muse.fullname" .)) (dig "auth" "existingSecret" "" (.Values.postgresql | default dict)) -}}
{{- end -}}
{{- end }}

{{/*
muse.dbPasswordKey: the key inside the DB password Secret that holds the password.
Defaults to "password" — Bitnami's userPasswordKey default.
*/}}
{{- define "muse.dbPasswordKey" -}}
{{- default "password" (((.Values.postgresql).auth).secretKeys).userPasswordKey -}}
{{- end }}

{{/*
muse.databaseUrlTemplate: DATABASE_URL with the literal $(DB_PASSWORD) placeholder.
Used by muse.dbEnv so k8s expands the password from the secretKeyRef at runtime.
Only meaningful for Postgres-backed deploys (postgresql.enabled).
*/}}
{{- define "muse.databaseUrlTemplate" -}}
{{- if (.Values.postgresql).enabled -}}
{{- printf "postgres://%s:$(DB_PASSWORD)@%s-postgresql:5432/%s?sslmode=disable" .Values.postgresql.auth.username (include "muse.fullname" .) .Values.postgresql.auth.database -}}
{{- end -}}
{{- end }}

{{/*
muse.dbEnv: renders DB_PASSWORD (secretKeyRef) + DATABASE_URL ($(VAR) expansion)
env entries for Postgres-backed deploys.
Output is a YAML list fragment; nindent it into an env: block.
Renders nothing for external-DB deploys (DATABASE_URL comes from the chart-managed Secret).
*/}}
{{- define "muse.dbEnv" -}}
{{- $secret := include "muse.dbPasswordSecretName" . }}
{{- if $secret }}
- name: DB_PASSWORD
  valueFrom:
    secretKeyRef:
      name: {{ $secret }}
      key: {{ include "muse.dbPasswordKey" . }}
- name: DATABASE_URL
  value: {{ include "muse.databaseUrlTemplate" . | quote }}
{{- end -}}
{{- end }}

{{/*
muse.dbHost: hostname of the Postgres Service (no port).
Used by the wait-db init container to gate on DB readiness.
Returns empty for external-DB deploys — those skip the wait loop.
*/}}
{{- define "muse.dbHost" -}}
{{- if (.Values.postgresql).enabled -}}
{{- printf "%s-postgresql" (include "muse.fullname" .) -}}
{{- end -}}
{{- end }}

{{/*
DATABASE_URL for external Postgres deployments only (postgresql.enabled: false).
For postgresql.enabled deploys DATABASE_URL is composed at runtime via muse.dbEnv
(DB_PASSWORD secretKeyRef + $(VAR) expansion) and must NOT be baked into the
chart-managed Secret — return empty for those deploys.
*/}}
{{- define "muse.databaseUrl" -}}
{{- if (.Values.postgresql).enabled -}}
{{- /* runtime-composed via muse.dbEnv */ -}}
{{- else -}}
{{- .Values.secrets.DATABASE_URL -}}
{{- end -}}
{{- end }}
