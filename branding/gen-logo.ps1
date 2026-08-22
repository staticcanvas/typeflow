# [cmdletbinding()]
# param(
#     [parameter(Mandatory,position=0)]
#     [string]$project,
#     [parameter(Mandatory,position=1)]
#     [string]$LogoName
# )
# Logo
mystro config -Source "./branding/typeflow-logo.svg" -OutputDir "./branding/dist" -AutoScale | mystro Gen

# Banner
#mystro config -Source "./lume-banner.svg" -OutputDir "./dist" -AutoScale | mystro Gen

# mystro config -Source "./" -OutputDir "./dist" -AutoScale | mystro Gen
