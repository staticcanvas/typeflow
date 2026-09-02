# {{ .Title }}

> {{ .Description | default site.Params.description }}

Canonical documentation: {{ .Permalink }}

{{ partial "markdown-content.html" . }}

{{ range .Pages.ByWeight }}- [{{ .Title }}]({{ .Permalink }}): {{ .Description }}
{{ end }}
