#
# This is a Shiny web application. You can run the application by clicking
# the 'Run App' button above.
#
# Find out more about building applications with Shiny here:
#
#    http://shiny.rstudio.com/
#

library(shiny)
library(rlist)

setwd("~/Documents/design-science-r/card-sorting/")
source("cluster-card-sorting.R")

# load datasets
default_datasets = list(
    list(name="Alfredo", file="Alfredo.csv"),
    list(name="Rafael", file="Rafael.csv")
)

# Define UI for application that draws a histogram
ui <- fluidPage(

    # Application title
    titlePanel("Card Sorting"),

    # Sidebar with a slider input for number of bins 
    sidebarLayout(
        sidebarPanel(
            fileInput("files", "Carregar CSVs",
                accept = c(
                    "text/csv",
                    "text/comma-separated-values,text/plain",
                    ".csv"),
                multiple = T
            ),
            sliderInput("clusters",
                        "Escolha a quantidade de clusters",
                        min = 2,
                        max = 10,
                        value = 3)
        ),

        # Show a plot of the generated distribution
        mainPanel(
           plotOutput("hclustPlot"),
           tableOutput("clustersTable")
        )
    )
)

# Define server logic required to draw a histogram
server <- function(input, output) {
    # update when file changes and feed other renders
    clusters <- reactive({
        datasets = list()
        if(!is.null(input$files)){
            for(row in 1:nrow(input$files)){
                datasets = list.append(datasets, list(
                    name=input$files[row, "name"],
                    file=input$files[row, "datapath"]
                ))
            }
        } else if(!is.null(default_datasets)){
            datasets = default_datasets
        }
        clusters <- getCardSortingClusters(datasets)
        return(clusters)
    })
    output$clustersTable <- renderTable({
        clusters <- clusters()
        return( getClusterTable(hclust=clusters$hclust, k=input$clusters) )
    })
    output$hclustPlot <- renderPlot({
        clusters <- clusters()
        median_clusters = input$clusters
        plot(clusters$hclust, main = "Dendrograma com clusterização hierárquica", xlab = "", sub = "")
        rect.hclust(clusters$hclust, k = median_clusters, border = 2:6)
    })
}

# Run the application 
shinyApp(ui = ui, server = server)
