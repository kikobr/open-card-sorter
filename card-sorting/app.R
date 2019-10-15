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
library(ggplot2)
library(ggdendro)

source("cluster-card-sorting.R")
source("ggdendro.R")

# load datasets
default_datasets = list(
    list(name="Alfredo", file="Alfredo.csv"),
    list(name="Rafael", file="Rafael.csv")
)

# Define UI for application that draws a histogram
ui <- fluidPage(

    # Application title
    titlePanel("Card Sorting"),
    h4("Custerização Hierárquica", style="font-size: 16px; color: gray;"),
    br(),

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
                        max = 30,
                        value = 3)
        ),

        # Show a plot of the generated distribution
        mainPanel(
           plotOutput("hclustPlot", height=700),
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
        
        hcdata <- dendro_data_k(clusters$hclust, median_clusters)
        plot_ggdendro(
            hcdata,
            direction   = "lr", # horizontal
            #direction   = "tb", # vertical
            expand.y    = 0.5,
            label.size  = 4.5,
            branch.size = 1
        ) +
            theme_light() +
            ylab("Distância (quanto menor, mais próximo)") +
            xlab("") +
            theme(panel.border = element_blank())+
            scale_fill_continuous(guide = guide_legend(title = NULL))
        
    })
}

# Run the application 
shinyApp(ui = ui, server = server)
