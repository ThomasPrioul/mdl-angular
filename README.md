# @mdl-angular

Librairies npm contenant des helpers, components, CSS... pour projets Angular v19+.

C'est un mono-repo créé avec nx workspace, qui produit actuellement 4 packages node:
- **@mdl-angular/common** : contient des pipes, helpers, directives qui comblent quelques manques dans angular (gestion des input type=date par exemple).
- **@mdl-angular/auth** : pour faciliter l'utilisation de l'OIDC et notamment keycloak MDL dans l'application Angular
- **@mdl-angular/ui-cdk** : lib qui contient à ce jour uniquement un component tooltip custom
- **@mdl-angular/ui-timewindow** : lib qui permet d'afficher un timepicker "AWS-style". Basé sur tailwindwss et daisyUI mais sans CSS de sortie imposé.

